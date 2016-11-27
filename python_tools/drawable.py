from models import Team, Service

def calculate_occupation_rate_of_team():
    sc_adjust = 250
    all_service = 0
    # Caluculate team rate
    # service_component adjustment 0.7 for each service groupd
    for i, team in enumerate(Team.get_teams()):
        key_candidate = i + 1
        team.key = key_candidate * -1
        # we don't consider about shared service team 
        if not team.shared_service_maintainer:
            all_service += len(team) 
            all_service += len(team.services) * sc_adjust
    # Update team rate for each team and service
    for team in Team.get_teams():
        rank = len(team) + len(team.services) * sc_adjust
        team.wide_rate = float(rank)/all_service
        team.update_service_rate()
