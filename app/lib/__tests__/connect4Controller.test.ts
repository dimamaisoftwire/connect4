import { Connect4Controller } from "../connect4Controller";

describe("Connect4Controller", () => {
  describe("makeMove", () => {
    it("should place token at bottom of empty column", () => {
      const controller = new Connect4Controller(7, 6);
      controller.newGame();

      const status = controller.makeMove(0);

      expect(status).not.toBeNull();
      expect(status?.board[5][0]).toBe(1);
      expect(status?.currentPlayer).toBe(2);
    });

    it("should stack tokens in same column", () => {
      const controller = new Connect4Controller(7, 6);
      controller.newGame();

      controller.makeMove(0);
      const status = controller.makeMove(0);

      expect(status).not.toBeNull();
      expect(status?.board[5][0]).toBe(1);
      expect(status?.board[4][0]).toBe(2);
    });

    it("should return null for negative column", () => {
      const controller = new Connect4Controller(7, 6);
      controller.newGame();

      const status = controller.makeMove(-1);

      expect(status).toBeNull();
    });

    it("should return null for column >= width", () => {
      const controller = new Connect4Controller(7, 6);
      controller.newGame();

      const status = controller.makeMove(7);

      expect(status).toBeNull();
    });

    it("should return null when column is full", () => {
      const controller = new Connect4Controller(7, 2);
      controller.newGame();

      controller.makeMove(0);
      controller.makeMove(0);
      const status = controller.makeMove(0);

      expect(status).toBeNull();
    });

    it("should alternate players on valid moves", () => {
      const controller = new Connect4Controller(7, 6);
      controller.newGame();

      const status1 = controller.makeMove(0);
      expect(status1?.currentPlayer).toBe(2);

      const status2 = controller.makeMove(1);
      expect(status2?.currentPlayer).toBe(1);

      const status3 = controller.makeMove(2);
      expect(status3?.currentPlayer).toBe(2);
    });

    it("should not switch player on invalid move", () => {
      const controller = new Connect4Controller(7, 6);
      controller.newGame();

      controller.makeMove(0);
      const beforeInvalid = controller.getStatus().currentPlayer;
      expect(beforeInvalid).toBe(2);

      controller.makeMove(-1);
      const afterInvalid = controller.getStatus().currentPlayer;
      expect(afterInvalid).toBe(2);
    });

    it("should detect horizontal win", () => {
      const controller = new Connect4Controller(7, 6);
      controller.newGame();

      controller.makeMove(0);
      controller.makeMove(0);
      controller.makeMove(1);
      controller.makeMove(1);
      controller.makeMove(2);
      controller.makeMove(2);
      const status = controller.makeMove(3);

      expect(status?.state).toBe("won");
      expect(status?.winner).toBe(1);
    });

    it("should detect vertical win", () => {
      const controller = new Connect4Controller(7, 6);
      controller.newGame();

      controller.makeMove(0);
      controller.makeMove(1);
      controller.makeMove(0);
      controller.makeMove(1);
      controller.makeMove(0);
      controller.makeMove(1);
      const status = controller.makeMove(0);

      expect(status?.state).toBe("won");
      expect(status?.winner).toBe(1);
    });

    it("should detect diagonal win (up-right)", () => {
      const controller = new Connect4Controller(7, 6);
      controller.newGame();

      controller.makeMove(0); 
      controller.makeMove(1);
      controller.makeMove(1); 
      controller.makeMove(2);
      controller.makeMove(2);
      controller.makeMove(3);
      controller.makeMove(2); 
      controller.makeMove(3);
      controller.makeMove(3); 
      controller.makeMove(5); 
      const status = controller.makeMove(3); 

      expect(status?.state).toBe("won");
      expect(status?.winner).toBe(1);
    });

    it("should detect diagonal win (up-left)", () => {
      const controller = new Connect4Controller(7, 6);
      controller.newGame();

      controller.makeMove(0);
      controller.makeMove(6);
      controller.makeMove(5);
      controller.makeMove(5);
      controller.makeMove(4);
      controller.makeMove(4);
      controller.makeMove(3);
      controller.makeMove(4);
      controller.makeMove(3);
      controller.makeMove(3);
      controller.makeMove(1);
      const status = controller.makeMove(3);

      expect(status?.state).toBe("won");
      expect(status?.winner).toBe(2);
    });

    it("should detect draw when board is full", () => {
      const controller = new Connect4Controller(4, 2);
      controller.newGame();

      controller.makeMove(0);
      controller.makeMove(1);
      controller.makeMove(2);
      controller.makeMove(3);
      controller.makeMove(0);
      controller.makeMove(1);
      controller.makeMove(2);
      const status = controller.makeMove(3);

      expect(status?.state).toBe("draw");
      expect(status?.winner).toBe(0);
    });

    it("should block moves after game is won", () => {
      const controller = new Connect4Controller(7, 6);
      controller.newGame();

      controller.makeMove(0);
      controller.makeMove(0);
      controller.makeMove(1);
      controller.makeMove(1);
      controller.makeMove(2);
      controller.makeMove(2);
      controller.makeMove(3);

      const status = controller.makeMove(4);

      expect(status).toBeNull();
    });

    it("should block moves after draw", () => {
      const controller = new Connect4Controller(4, 2);
      controller.newGame();

      controller.makeMove(0);
      controller.makeMove(1);
      controller.makeMove(2);
      controller.makeMove(3);
      controller.makeMove(0);
      controller.makeMove(1);
      controller.makeMove(2);
      controller.makeMove(3);

      const status = controller.makeMove(0);

      expect(status).toBeNull();
    });
  });
});
