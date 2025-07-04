const Game = require('../Models/game-model.js');

class GameService {
    async allGames(){
        const games = await Game.find().sort({ createdAt: -1 });

        return games
    }

    async createGame(data){
        const game = new Game(data);
        await game.save();

        return game;
    }

    async updateGame(id, data){
        const updatedGame = await Game.findByIdAndUpdate(
            id,
            data,
            { new: true, runValidators: true }
          );

        return updatedGame;
    }
    
    async deleteGame(id){
        const deletedGame = await Game.findByIdAndDelete(id);

        return deletedGame;
    }
}

module.exports = new GameService();