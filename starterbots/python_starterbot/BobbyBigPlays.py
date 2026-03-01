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

from PlanetWars import PlanetWars
import random


def DoTurn(pw):
    # Don't send new fleet if one is already in flight
    if len(pw.MyFleets()) >= 1:
        return

    my_planets = pw.MyPlanets()
    not_my_planets = pw.NotMyPlanets()

    if not my_planets or not not_my_planets:
        return

    source = random.choice(my_planets)
    dest = random.choice(not_my_planets)

    # Send half the ships (integer division)
    if source.NumShips() > 1:
        num_ships = source.NumShips() // 2
        pw.IssueOrder(source.PlanetID(), dest.PlanetID(), num_ships)


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