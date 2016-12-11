from models import Service
from copy import copy
from python_tools.config import *
from python_tools.common import create_drawable_object

# Calculate and update the occupation rate of
# team and service object
def calculate_occupation_rate_of_team(teams):
    sc_adjust = 250
    all_service = 0
    # Caluculate team rate
    # service_component adjustment 0.7 for each service groupd
    for i, team in enumerate(teams):
        all_service += len(team)
        all_service += len(team.services) * sc_adjust
    # Update team rate for each team and service
    for team in teams:
        rank = len(team) + len(team.services) * sc_adjust
        team.wide_rate = float(rank)/all_service
        team.update_service_rate()

def get_graph_data_with_vertical_by_team(
        teams,
        current_horizontal_point, current_vertical_point):
  result_array = []
  for team in teams:
    team_box_width = total_width * team.wide_rate
    current_horizontal_point_maximum = current_horizontal_point + team_box_width
    sc_current_horizontal_point = current_horizontal_point
    sc_height = current_vertical_point
    most_sc_height = 0
    sc_left = sc_current_horizontal_point + box_margin_left

    result = create_drawable_object(
            team,
            loc=str(sc_current_horizontal_point)+' '+str(sc_height),
            category_super=True, width=team_box_width)
    result_array.append(result)

    sc_w_q = copy(team.services)
    sc_check_q = list()
    while len(sc_w_q) > 0:
        sc = sc_w_q.pop()
        sc_minimum_w =\
            len(sc.most_longname_service().name) * one_charactor_width

        if sc_minimum_w > (team_box_width - sc_box_margin_left * 2) * sc.wide_rate:
            sc_width = sc_minimum_w
        else:
            sc_width = (team_box_width - sc_box_margin_left * 2) * sc.wide_rate

        if sc_width + box_margin_left > team_box_width:
            team_box_width =  sc_width + sc_box_margin_left
            team.drawable['width'] = team_box_width
            current_horizontal_point_maximum = current_horizontal_point + team_box_width
        # if over assignment of team width
        if sc_left + sc_width > current_horizontal_point_maximum:
            if sc in sc_check_q:
                sc_check_q = list()
                sc_left = sc_current_horizontal_point + box_margin_left
                sc_height = most_sc_height + sc_box_margin_top
                most_sc_height = 0
            else:
                sc_check_q.append(sc)
            sc_w_q.insert(0, sc)
            continue
        result = create_drawable_object(
                sc, team, [team.key],
                loc=str(sc_left)+' '+str(sc_height),
                category_super=True,
                width=sc_width)
        result_array.append(result)

        sc_inner_height = sc_height
        sc_inner_left = sc_left
        s_w_q = copy(sc.children)
        check_q = list()
        while len(s_w_q) > 0:
            service = s_w_q.pop()
            s_long = len(service.name) * one_charactor_width
            if s_long + sc_inner_left > sc_left + sc_width:
                if service in check_q:
                    check_q = list()
                    sc_inner_left = sc_left
                    sc_inner_height += box_height
                else:
                    check_q.append(service)
                s_w_q.insert(0, service)
                continue
            else:
                result = create_drawable_object(service, team,[sc.key],
                    str(sc_inner_left) +" "+ str(sc_inner_height), width=s_long)
                result_array.append(result)
                if sc_inner_height > most_sc_height:
                    most_sc_height = sc_inner_height
                sc_inner_left += one_charactor_width * len(service.name) + box_margin_left
        sc.drawable['width'] = sc.get_x_cordinate_of_rightest_service() - sc_left
        sc_left = sc.get_x_cordinate_of_rightest_service() + sc_box_margin_left

    current_horizontal_point = team.get_x_cordinate_of_rightest_sg() + team_margin_left
  return result_array
