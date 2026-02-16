"""Rock Paper Scissors """

import random
MOVES = ["rock", "paper", "scissors"]


def beats(one, two):
    """Return True if move `one` beats move `two`."""
    return ((one == "rock" and two == "scissors") or
            (one == "scissors" and two == "paper") or
            (one == "paper" and two == "rock"))


class Player:
    def __init__(self, name="Player"):
        self.name = name
        self.score = 0
        self.my_moves = []
        self.their_moves = []

    def move(self):
        raise NotImplementedError

    def learn(self, my_move, their_move):
        self.my_moves.append(my_move)
        self.their_moves.append(their_move)


class RockPlayer(Player):
    def move(self):
        return "rock"


class RandomPlayer(Player):
    def move(self):
        return random.choice(MOVES)


class ReflectPlayer(Player):
    def move(self):
        if self.their_moves:
            return self.their_moves[-1]
        return random.choice(MOVES)


class CyclePlayer(Player):
    def move(self):
        if not self.my_moves:
            return random.choice(MOVES)
        last = self.my_moves[-1]
        idx = MOVES.index(last)
        return MOVES[(idx + 1) % len(MOVES)]


class HumanPlayer(Player):
    def move(self):
        while True:
            choice = input("Your move (rock/paper/scissors or quit): ").strip()
            choice = choice.lower()
            if choice == "quit":
                return "quit"
            if choice in MOVES:
                return choice
            print("Invalid move. Please type rock, paper, scissors, or quit.")


class Game:
    def __init__(self, p1, p2):
        self.p1 = p1
        self.p2 = p2
        self.rounds_played = 0

    def _round_winner(self, move1, move2):
        if beats(move1, move2):
            return 1
        if beats(move2, move1):
            return 2
        return 0

    def play_round(self):
        move1 = self.p1.move()
        if move1 == "quit":
            return False

        move2 = self.p2.move()
        if move2 == "quit":
            return False

        self.rounds_played += 1
        print(f"\nRound {self.rounds_played}")
        print(f"{self.p1.name}: {move1} | {self.p2.name}: {move2}")

        winner = self._round_winner(move1, move2)
        if winner == 1:
            self.p1.score += 1
            print(f"{self.p1.name} wins the round!")
        elif winner == 2:
            self.p2.score += 1
            print(f"{self.p2.name} wins the round!")
        else:
            print("It's a tie!")

        print(f"Score -> {self.p1.name}: {self.p1.score} | "
              f"{self.p2.name}: {self.p2.score}")

        self.p1.learn(move1, move2)
        self.p2.learn(move2, move1)
        return True

    def play_match(self, target_wins=None):
        print("\nGame start!")
        print(f"{self.p1.name} vs {self.p2.name}\n")

        while True:
            if target_wins is not None:
                if (
                    self.p1.score >= target_wins
                    or self.p2.score >= target_wins
                ):
                    break

            keep_playing = self.play_round()
            if not keep_playing:
                break

        print("\nGame over!")
        self._announce_winner(target_wins)

    def _announce_winner(self, target_wins):
        """Print final result and scores."""
        print(f"Final score -> {self.p1.name}: {self.p1.score} | "
              f"{self.p2.name}: {self.p2.score}")

        if self.p1.score > self.p2.score:
            print(f"Winner: {self.p1.name}")
        elif self.p2.score > self.p1.score:
            print(f"Winner: {self.p2.name}")
        else:
            if target_wins is None:
                print("Match ended in a tie.")
            else:
                print("It's a tie (unexpected in target-wins mode).")


def choose_opponent():
    options = {
        "1": ("Always Rock", RockPlayer),
        "2": ("Random", RandomPlayer),
        "3": ("Reflect", ReflectPlayer),
        "4": ("Cycle", CyclePlayer),
    }
    print("Choose a computer opponent:")
    for key, (label, _) in options.items():
        print(f"{key}. {label}")

    while True:
        choice = input("Enter 1, 2, 3, or 4: ").strip()
        if choice in options:
            label, cls = options[choice]
            return cls(name=f"Computer ({label})")
        print("Invalid choice. Please enter 1, 2, 3, or 4.")


def choose_match_type():
    print("\nMatch type:")
    print("1. Best of 3 (first to 2 wins)")
    print("2. Best of 5 (first to 3 wins)")
    print("3. Play until someone quits")

    while True:
        choice = input("Enter 1, 2, or 3: ").strip()
        if choice == "1":
            return 2
        if choice == "2":
            return 3
        if choice == "3":
            return None
        print("Invalid choice. Please enter 1, 2, or 3.")


def main():
    name = input("What's your name? ").strip() or "Human"
    human = HumanPlayer(name=name)
    computer = choose_opponent()
    target_wins = choose_match_type()

    game = Game(human, computer)
    game.play_match(target_wins=target_wins)


if __name__ == "__main__":
    main()

