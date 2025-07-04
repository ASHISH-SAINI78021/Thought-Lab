const GameService = require("../services/game-service.js");

class GameController {
  // Get all games
  async getAllGames(req, res) {
    try {
      const games = await GameService.allGames();
      if (games.length == 0) {
        console.log("No games");
        return res.json({
            success : false,
            message : "No games"
        });
      }
      res.json({
        success: true,
        data: games
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch games',
        error: error.message
      });
    }
  }

  // Create a new game
  async createGame(req, res) {
    try {
      const { name, description, prize, formLink } = req.body;
      
      // Validate required fields
      if (!name || !description || !prize || !formLink) {
        console.log("All fields are required");
        return res.status(400).json({
          success: false,
          message: 'All fields are required'
        });
      }

      const game = await GameService.createGame(req.body);

      console.log(game);

      res.status(201).json({
        success: true,
        data: game,
        message: 'Game created successfully'
      });
    } catch (error) {
      console.error(error);
      res.status(400).json({
        success: false,
        message: 'Failed to create game',
        error: error.message
      });
    }
  }

  // Update a game
  async updateGame(req, res) {
    try {
      const { id } = req.params;
      const { name, description, prize, formLink } = req.body;

      if (!id || !name || !description || !prize || !formLink){
        console.log("All fields are required");
        return res.json({
            success : false,
            message : "All fields are required"
        });
      }
      
      const updatedGame = await GameService.updateGame(
        id,
        { 
          name, 
          description, 
          prize, 
          formLink,
          updatedAt: Date.now()
        }
      );

      if (!updatedGame) {
        return res.status(404).json({
          success: false,
          message: 'Game not found'
        });
      }
      
      res.json({
        success: true,
        data: updatedGame,
        message: 'Game updated successfully'
      });
    } catch (error) {
      console.error(error);
      res.status(400).json({
        success: false,
        message: 'Failed to update game',
        error: error.message
      });
    }
  }

  // Delete a game
  async deleteGame(req, res) {
    try {
      const { id } = req.params;
      const deletedGame = await GameService.deleteGame(id);
      
      if (!deletedGame) {
        return res.status(404).json({
          success: false,
          message: 'Game not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Game deleted successfully'
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete game',
        error: error.message
      });
    }
  }
}

// Create controller instance
module.exports = new GameController();
