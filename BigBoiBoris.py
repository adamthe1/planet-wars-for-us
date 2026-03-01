#!/usr/bin/env python
#

"""
// The DoTurn function is where your code goes. The PlanetWars object contains
// the state of the game, including information about all planets and fleets
// that currently exist. Inside this function, you issue orders using the
// pw.IssueOrder() function. For example, to send 10 ships from planet 3 to
// planet 8, you would say pw.IssueOrder(3, 8, 10).
//
// There is already a basic strategy in place here. You can use it as a
// starting point, or you can throw it out entirely and replace it with your
// own. Check out the tutorials and articles on the contest website at
// http://www.ai-contest.com/resources.
"""

from PlanetWars import PlanetWars, Planet
from random import randint


def DoTurn(pw):
    # (2) Find my strongest planet.

    my_planets = pw.MyPlanets()
    ranking = sorted(my_planets, key=Planet.NumShips)

    # (3) Find the weakest enemy or neutral planet.
    not_my_planets = pw.NotMyPlanets()
    not_my_ranking = sorted(not_my_planets, key=Planet.NumShips)

    if not ranking or not not_my_ranking:
        return

    # find closest planet
    distances = sorted(not_my_planets, key=lambda x: pw.Distance(ranking[0].PlanetID(), x.PlanetID()))

    randy = randint(0, 10)
    if randy == 5:
        num_ships = ranking[0].NumShips() / 2
        pw.IssueOrder(ranking[0].PlanetID(), distances[0].PlanetID(), num_ships)
    if randy == 2:
        num_ships = ranking[0].NumShips() / 3
        pw.IssueOrder(ranking[0].PlanetID(), not_my_ranking[-1].PlanetID(), num_ships)
    # (4) Send half the ships from my strongest planet to the weakest


def main():
    map_data = ''
    while True:
        current_line = input()
        if len(current_line) >= 2 and current_line.startswith("go"):
            pw = PlanetWars(map_data)
            DoTurn(pw)
            pw.FinishTurn()
            map_data = ''
        else:
            map_data += current_line + '\n'


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print('ctrl-c, leaving ...')