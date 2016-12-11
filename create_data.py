import sys
from copy import copy
import yaml
import json
from python_tools.models import (
  Team, Service,
  load_teams_and_services
)
from python_tools.common import (
  create_drawable_object,
  print_help
)
from python_tools import drawable
from python_tools.config import *

result_array = list()

load_teams_and_services(FILE_NAME_SV)
first_teams = copy(Team.get_teams())

drawable.calculate_occupation_rate_of_team(first_teams)
result_array += drawable.get_graph_data_with_vertical_by_team(
            first_teams, 400, 100)


load_teams_and_services(FILE_NAME)
all_teams = Team.get_teams()
second_teams = set(all_teams) - set(first_teams)

drawable.calculate_occupation_rate_of_team(second_teams)
result_array += drawable.get_graph_data_with_vertical_by_team(
            second_teams, 100, 400)


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
