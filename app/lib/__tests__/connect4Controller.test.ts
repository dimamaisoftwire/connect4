import { Connect4Controller } from '../connect4Controller';

describe('Connect4Controller', () => {
  describe('makeMove', () => {
    it('should fill a 1x1 grid when making a move in column 0', () => {
      const controller = new Connect4Controller(1, 1);
      controller.newGame();
      
      const status = controller.makeMove(0);
      
      expect(status).not.toBeNull();
      expect(status?.board[0][0]).toBe(1);
    });
  });
});
