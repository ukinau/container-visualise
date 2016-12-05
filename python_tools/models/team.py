class Team(object):
  TEAM_LIST = list() 
  def __init__(self, name, shared_service_maintainer=False): 
      self.services = list()
      self.name = name
      self.description = ""
      self.shared_service_maintainer = shared_service_maintainer 
      self.wide_rate = 0
      self.key = None
      self.drawable = None

  def add_service(self, service):
      if not self.check_duplicate(service):
          self.services.append(service)

  def check_duplicate(self, service):
      for sv in self.services:
          if sv is service:
              return True
      return False

  def __len__(self):
      result = 0
      for service in self.services:
          if service.children:
              result += len(service.children)
          else:
              result += 1
      return result

  def update_service_rate(self):
      all_service = len(self)
      for service in self.services:
          service.wide_rate = float(
              len(service.children))/all_service

  def get_x_cordinate_of_rightest_sg(self):
      rightest_cordinate = 0
      for sg in self.services:
          loc = sg.drawable['loc'].split(' ')
          x = float(loc[0]) + float(sg.drawable['width']) 
          if x > rightest_cordinate:
              rightest_cordinate = x
      return rightest_cordinate

  @classmethod
  def eliminate_team_from_list(cls, name):
      for i, team in enumerate(cls.TEAM_LIST):
          if team.name == name:
              return cls.TEAM_LIST.pop(i)
      return None

  @classmethod
  def get_teams_with_shared_service_maintainer(cls):
      result = list() 
      for team in cls.TEAM_LIST:
          if team.shared_service_maintainer:
              result.append(team) 
      return result

  @classmethod
  def find_team_by_name(cls, name):
      for team in cls.TEAM_LIST:
          if team.name == name:
              return team
      return None

  @classmethod
  def get_teams(cls):
      return cls.TEAM_LIST

  @classmethod
  def create_team(cls, name, shared_service_maintainer=False):
      team = Team.find_team_by_name(name)
      if not team:
          team = Team(name, shared_service_maintainer)
          Team.TEAM_LIST.append(team)
      return team

  @classmethod
  def get_relationship_of_all_teams(cls):
      result_array_link = []
      for team in cls.get_teams():
          for sc in team.services:
              for s in sc.children:
                  for dep in s.dependencies:
                      dep_s = dep.to_instance
                      result_array_link.append({'from': s.key, 'to': dep_s.key, 'from_name': s.name, 'to_name': dep_s.name, 'op': dep.operation, 'topics': dep.topics}) 
      return result_array_link

