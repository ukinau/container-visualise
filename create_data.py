import sys
from copy import copy
import yaml
import json
from python_tools.models import (
  Team, Service,
  load_teams_and_services
)
from python_tools.common import (
  get_something_from_label,
  create_drawable_object,
  print_help
)
from python_tools import drawable
from python_tools.config import *


load_teams_and_services(FILE_NAME)
load_teams_and_services(FILE_NAME_SV, shared=True)

result_array = list()

# Calculate and update the occupation rate of
# team and service object
drawable.calculate_occupation_rate_of_team()

for team in Team.get_teams_with_shared_service_maintainer():
    result = create_drawable_object(team,category_super=True)
    result_array.append(result)
    for sc in team.services:
        result = create_drawable_object(sc, team,[team.key], category_super=True)
        result_array.append(result)
        if sc.name == 'Volumes':
            shared_height = shared_height_volumes
        else:
            shared_height = shared_height_containers
        inner_shared_left = shared_left
        for s in sc.children:
            result = create_drawable_object(s, team,[sc.key],
                str(inner_shared_left) +" "+ str(shared_height), width=len(s.name * one_charactor_width))
            result_array.append(result)
            margin_calculated = one_charactor_width * len(s.name) + box_margin_left
            if margin_calculated < 80:
                margin_calculated = 80
            inner_shared_left += margin_calculated
        

current_horizontal_point = 100
current_vertical_point = 400
for team in Team.get_teams():
    if team.shared_service_maintainer:
        continue
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
        sc_left += sc_width + sc_box_margin_left
    current_horizontal_point = current_horizontal_point_maximum + team_margin_left

if __name__ == '__main__':

    if len(sys.argv) < 2:
        print_help()
        sys.exit(1)

    if sys.argv[1] == '--resource':
        print(json.dumps(result_array))
    elif sys.argv[1] == '--link':
        result_array_link = Team.get_relationship_of_all_teams()
        print(json.dumps(result_array_link))
    elif sys.argv[1] == '--data-output':
        result_array_link = Team.get_relationship_of_all_teams()
        base_filepath = DEFAULT_BASE_OUTPUT_FILE
        if len(sys.argv) > 2:
            base_filepath = sys.argv[2]
        for file_path, data in (('service_data', result_array),
                                ('dependencies', result_array_link)):
            target = base_filepath + '_' + file_path + '.js'
            with open(target, 'w') as fd:
                print('Write: %s' % target)
                fd.write(file_path+' = '+json.dumps(data))
    else:
        print_help()
