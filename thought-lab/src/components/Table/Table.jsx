import React, { useEffect, useState } from "react";
import { url } from "../../url";
import styles from "./Table.module.css";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { useAuth } from "../../Context/auth";
import SplashCursor from "../react-bits/SplashCursor";
import { Search, Trophy, Crown, Medal, ChevronDown } from "lucide-react";
import { getTier } from "../../utils/soulXp";

const socket = io(`${url}`);

const getProfileImage = (path) => {
  if (!path || path === 'null' || path === 'undefined' || path === 'fallback-avatar.png') return null;
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${url}/${cleanPath}`;
};

const rowOptions = [5, 8, 20];

/* ── rank medal helper ── */
const RankBadge = ({ rank }) => {
  if (rank === 1) return <span className={styles.rankGold}><Crown size={14} /> 1</span>;
  if (rank === 2) return <span className={styles.rankSilver}><Medal size={14} /> 2</span>;
  if (rank === 3) return <span className={styles.rankBronze}><Medal size={14} /> 3</span>;
  return <span className={styles.rankNum}>{rank}</span>;
};

const Table = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [auth] = useAuth();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /* ── socket live data ── */
  useEffect(() => {
    setLoading(true);
    socket.emit("get-initial-leaderboard");

    socket.on("leaderboard-data", (leaderboard) => {
      setData(leaderboard);
      setLoading(false);
    });

    socket.on("leaderboard-update", (leaderboard) => {
      setData(leaderboard);
    });

    socket.on("connect_error", () => setLoading(false));

    const timeout = setTimeout(() => setLoading(false), 10000);

    return () => {
      socket.off("leaderboard-data");
      socket.off("leaderboard-update");
      socket.off("connect_error");
      clearTimeout(timeout);
    };
  }, []);

  /* ── current user rank ── */
  const currentUserId = auth?.user?._id || auth?.user?.id;
  const myRankIndex = data.findIndex(
    (item) => item.user?._id === currentUserId || item.user?.id === currentUserId
  );
  const myRank = myRankIndex !== -1 ? myRankIndex + 1 : null;
  const myEntry = myRankIndex !== -1 ? data[myRankIndex] : null;
  const myTier = myEntry ? getTier(myEntry.score) : null;

  /* ── filter & paginate ── */
  const filteredData = data.filter((item) => {
    const name = item?.user?.name || "";
    const roll = item?.user?.rollNumber || "";
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      roll.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  /* ── top 3 podium ── */
  const topThree = data.slice(0, 3);

  const podiumOrder = [
    topThree[1] && { ...topThree[1], rank: 2 },
    topThree[0] && { ...topThree[0], rank: 1 },
    topThree[2] && { ...topThree[2], rank: 3 },
  ].filter(Boolean);

  return (
    <div className={styles.page}>
      <SplashCursor />

      {/* ── Hero ── */}
      <div className={styles.hero}>
        <span className={styles.heroEyebrow}>Live Rankings</span>
        <h1 className={styles.heroTitle}>
          <Trophy size={36} /> <span>Leaderboard</span>
        </h1>
        <p className={styles.heroSub}>Real-time rankings updated live via WebSocket</p>
      </div>

      {/* ── Current User Rank Card (LeetCode-style) ── */}
      {myEntry && !loading && (
        <div className={styles.myRankCard} style={{ borderColor: myTier.color, boxShadow: myTier.shadow }}>
          <div className={styles.myRankLeft}>
            <div className={styles.myAvatar} style={{ boxShadow: myTier.shadow, borderColor: myTier.color }}>
              {myEntry.user?.profilePicture ? (
                <img src={getProfileImage(myEntry.user.profilePicture)} alt={myEntry.user.name} className={styles.avatarImg} />
              ) : (
                myEntry.user?.name?.[0]?.toUpperCase() || "?"
              )}
            </div>
            <div>
              <p className={styles.myName}>{myEntry.user?.name}</p>
              <p className={styles.myMeta}>
                {myEntry.user?.rollNumber} · <span style={{ color: myTier.color, fontWeight: 'bold' }}>{myTier.emoji} {myTier.title}</span>
              </p>
            </div>
          </div>
          <div className={styles.myRankRight}>
            <div className={styles.myRankStat}>
              <span className={styles.myRankValue}>#{myRank}</span>
              <span className={styles.myRankLabel}>Your Rank</span>
            </div>
            <div className={styles.myRankDivider} />
            <div className={styles.myRankStat}>
              <span className={styles.myScoreValue} style={{ color: myTier.color }}>{myEntry.score}</span>
              <span className={styles.myRankLabel}>Soul XP</span>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner} />
          <p className={styles.loadingText}>Loading leaderboard…</p>
        </div>
      ) : (
        <>
          {/* ── Podium Top 3 ── */}
          {topThree.length >= 3 && !searchTerm && (
            <div className={styles.podium}>
              {podiumOrder.map(({ user, score, rank }) => {
                const pTier = getTier(score);
                return (
                  <div
                    key={rank}
                    className={`${styles.podiumCard} ${styles[`podium${rank}`]}`}
                    onClick={() => navigate(`/leaderboard/${user?._id}`)}
                  >
                    <div className={styles.podiumAvatar} style={{ outline: `2px solid ${pTier.color}`, boxShadow: pTier.shadow }}>
                      {user?.profilePicture ? (
                        <img src={getProfileImage(user.profilePicture)} alt={user.name} className={styles.avatarImg} />
                      ) : (
                        user?.name?.[0]?.toUpperCase() || "?"
                      )}
                    </div>
                    <div className={styles.podiumMedal}>
                      {rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}
                    </div>
                    <p className={styles.podiumName}>{user?.name}</p>
                    <p className={styles.podiumScore} style={{ color: pTier.color }}>{score} Soul XP</p>
                  </div>
                )
              })}
            </div>
          )}

          {/* ── Search bar ── */}
          <div className={styles.toolbar}>
            <div className={styles.searchBox}>
              <Search size={16} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search name or roll no…"
                className={styles.searchInput}
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <div className={styles.rowsSelect}>
              <span>Rows:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className={styles.select}
              >
                {rowOptions.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <ChevronDown size={14} />
            </div>
          </div>

          {/* ── Table ── */}
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Player</th>
                  <th className={styles.hideOnMobile}>Roll No.</th>
                  <th className={styles.hideOnMobile}>Tier</th>
                  <th>Soul XP</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((item, index) => {
                    const globalRank = (currentPage - 1) * rowsPerPage + index + 1;
                    const isMe = item.user?._id === currentUserId || item.user?.id === currentUserId;
                    const tier = getTier(item.score);
                    return (
                      <tr
                        key={item._id}
                        onClick={() => navigate(`/leaderboard/${item.user?._id}`)}
                        className={`${styles.row} ${isMe ? styles.myRow : ""}`}
                      >
                        <td><RankBadge rank={globalRank} /></td>
                        <td>
                          <div className={styles.playerCell}>
                            <div className={styles.playerAvatar} style={{ borderColor: tier.color, boxShadow: tier.shadow }}>
                              {item.user?.profilePicture ? (
                                <img src={getProfileImage(item.user.profilePicture)} alt={item.user.name} className={styles.avatarImg} />
                              ) : (
                                item.user?.name?.[0]?.toUpperCase() || "?"
                              )}
                            </div>
                            <span className={styles.playerName}>
                              {item.user?.name || "—"}
                              {isMe && <span className={styles.meTag}>You</span>}
                            </span>
                          </div>
                        </td>
                        <td className={styles.hideOnMobile}>{item.user?.rollNumber || "—"}</td>
                        <td className={styles.hideOnMobile} style={{ color: tier.color, fontWeight: 'bold' }}>
                          <span style={{ fontSize: '1.2em', marginRight: '4px' }}>{tier.emoji}</span> {tier.title}
                        </td>
                        <td className={styles.scoreCell} style={{ color: tier.color, textShadow: tier.shadow }}>{item.score}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className={styles.emptyCell}>
                      {searchTerm ? "No matching students found." : "No data available."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >← Prev</button>
              <span className={styles.pageInfo}>
                {currentPage} / {totalPages}
              </span>
              <button
                className={styles.pageBtn}
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
              >Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Table;