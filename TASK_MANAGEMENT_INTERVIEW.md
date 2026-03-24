# Thought Lab 2 - Task Management System Interview Questions

This document contains a list of interview questions and answers based on the **Task Management System** feature of the **Thought Lab 2** project. It covers task lifecycles, bidding, score rewards, penalty deductions, and real-time updates.

---

## 1. Feature Overview & Architecture

### Q1: Can you explain the flow of the Task Management System in your project?
**Answer:** The task management system allows Admins to create tasks with specific details (title, description, deadline, score reward, and penalty). The lifecycle of a task goes through different statuses: `OPEN`, `ASSIGNED`, `COMPLETED`, and `FAILED`.
1.  **Open:** A newly created task is `OPEN`. Students can "bid" on it.
2.  **Assigned:** The Admin reviews the bidders and assigns the task to a specific student, changing the status to `ASSIGNED`.
3.  **Completed/Failed:** Once the Admin reviews the student's work, they can mark it as either `COMPLETED` (adding the reward score to the student's leaderboard entry) or `FAILED` (deducting the penalty score). 

### Q2: What data models are involved in this system?
**Answer:** The core model is `Task` (`task-model.js`), which references the `User` model (`assignedTo` and an array of `bidders`). It also interacts with the `Leaderboard` model (to update scores when tasks are completed or failed).

---

## 2. Bidding & Task Assignment

### Q3: How does the bidding process work, and how do you prevent users from bidding multiple times?
**Answer:** When a student bids on an `OPEN` task, their `userId` is added to the `bidders` array in the `Task` document. In the `bidOnTask` controller, we use `task.bidders.includes(userId)` to ensure the user cannot bid more than once, returning a `400 Bad Request` if they try.

### Q4: How do you handle assigning a task to a user who hasn't bid on it?
**Answer:** The `assignTask` controller is flexible. The Admin can assign a task by providing either a `userId` (from the list of bidders) or an `email`. This means Admins can bypass the bidding process and directly assign tasks to specific students by looking up their email in the database.

---

## 3. Real-time Leaderboard Updates

### Q5: How is the leaderboard updated when a task is completed?
**Answer:** In the `completeTask` controller, we look up the student's entry in the `Leaderboard` collection. If it exists, we add the `task.scoreReward` to their existing score and save it. If not, we create a new leaderboard entry for them with a base score plus the reward. Finally, we emit a `leaderboard-update` event using Socket.IO so all connected clients see the updated rankings immediately.

### Q6: Can a user's score drop below zero if they fail too many tasks?
**Answer:** No. In the `failTask` controller, we update the student's leaderboard score using `Math.max(0, leaderboardEntry.score - task.scorePenalty)`. This prevents the score from dropping into negative values, ensuring fairness in the gamified system.

### Q7: The previous documentation mentions using `$inc` for atomic score updates, but your task controller uses `.score += ...` and `.save()`. What's the difference?
**Answer:** 
- Iterating with `.score += ...` and `await ...save()` fetches the document into memory, modifies it, and saves it. This could potentially lead to race conditions if multiple requests update the same user's score simultaneously. 
- Using `$inc` directly in a query (e.g., `Leaderboard.findOneAndUpdate({ user: userId }, { $inc: { score: scoreReward } })`) pushes the update atomic operation to the MongoDB server, which is safer under high concurrency. I used the `.save()` approach here because tasks are manually marked complete by a single Admin, making race conditions highly unlikely for this specific operation.

---

## 4. Notifications & Emails

### Q8: What kind of notifications are sent when tasks are created or updated?
**Answer:** There are two types of notifications:
1.  **In-App Notifications:** Using the `NotificationController`, we generate persistent notifications in the app (e.g., when a new task is created or assigned to a student).
2.  **Email Notifications:** We use `emailService` to send transactional emails via EmailJS. We send emails when a task is assigned, marked as completed, or marked as failed.

### Q9: How do you handle errors during the email sending process?
**Answer:** The `emailService` is designed to be fault-tolerant using `try-catch` blocks. If an email fails to send (perhaps due to rate limits or API unavailability), we log the error but allow the main transaction (like assigning a task or completing it) to finish successfully. We don't want an email failure to halt the core business workflow.

---

## 5. Security & Edge Cases

### Q10: How do you secure task actions so only authorized users can perform them?
**Answer:** The routes for creating, assigning, completing, failing, and deleting tasks are protected by our `isAdmin` middleware. Bidding, however, is open to any authenticated user via the `isLogin` middleware. This enforces role-based access control (RBAC).

### Q11: How do you ensure tasks aren't modified when they shouldn't be?
**Answer:** We check the `status` of the task before performing state changes.
- In `bidOnTask`, we return an error if `task.status !== 'OPEN'`.
- In `completeTask` and `failTask`, we return an error if `task.status !== 'ASSIGNED'`. This guarantees the task acts like a finite state machine, preventing logical bugs (like completing an unassigned task).
