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
import random


def DoTurn(pw):
    # (1) If we currently have a fleet in flight, just do nothing.
    if len(pw.MyFleets()) > len(pw.MyPlanets()):
        return
    # (2) calculate the av  erage of my planets
    my_planet_scores = []
    chosen_planet_scores = []
    chosen_planets = []
    total_score = 0
    source = -1
    source_score = -999999.0
    source_num_ships = 0
    my_planets = pw.MyPlanets()
    for p in my_planets:
        score = float(p.NumShips())
        total_score += score
        my_planet_scores.append(score)
    average_score = total_score / max(1, len(my_planets))

    for p in my_planets:
        score = float(p.NumShips())
        if score >= average_score:
            chosen_planets.append(p)


    # (3) Find the weakest enemy or neutral planet.
    chosen_enemy_planets = []
    enemy_scores = 0
    len_enemies = 0
    dest = -1
    dest_score = -999999.0
    not_my_planets = pw.NotMyPlanets()
    for p in not_my_planets:
        score = 1.0 / (1 + p.NumShips())
        enemy_scores += score
        len_enemies += 1
    average_enemies = enemy_scores / max(1, len_enemies)
    for p in not_my_planets:
        score = 1.0 / (1 + p.NumShips())
        if score >= average_enemies:
            chosen_enemy_planets.append(p)

    for p in chosen_planets:
        orders = 0
        for e in chosen_enemy_planets:
            if orders > 0:
                break
            source = p.PlanetID()
            dest = e.PlanetID()
            num_ships = p.NumShips() / 2
            pw.IssueOrder(source, dest, num_ships)
            orders += 1



def DoTurn2(pw):
    # (1) If we currently have a fleet in flight, just do nothing.
    distance = 0

    if len(pw.MyPlanets()) == 1:
        for p in pw.MyPlanets():
            for np in pw.NotMyPlanets():
                if pw.Distance(np.PlanetID(), p.PlanetID()) > distance:
                    distance = pw.Distance(np.PlanetID(), p.PlanetID())
                    farthest_planet = np.PlanetID()

    for p in pw.MyPlanets():
        better_planet = pw.Planets()[0]
        for planet in pw.Planets():

            if planet.Distance(p.PlanetID(), p.PlanetID()) > distance:
                pass




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
