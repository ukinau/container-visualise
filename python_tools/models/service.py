
class Service(object):
  SERVICE_TYPE_COMPONENT = "component"
  SERVICE_TYPE_COMPONENT_GROUP = "component-group"
  SERVICE_LIST = list()
  def __init__(self, name, description, dependencies, service_type="component"):
      self.name = name
      self.description = description
      self.dependencies = list()
      self.reffered_from = list()
      self.service_type = service_type

      if service_type == Service.SERVICE_TYPE_COMPONENT:
        self.children = None
        self.resolve_dependencies(dependencies)
      else:
        self.children = list()
      self.wide_rate = 0
      self.minimum_wide = 0
      self.key = len(Service.SERVICE_LIST)
      Service.SERVICE_LIST.append(self)


  def add_chidren(self, service):
      self.children.append(service)

  def add_reffered_from(self, service):
      self.reffered_from.append(service)

  def resolve_dependencies(self, dependencies):
      for dependency in dependencies:
          service = Service.find_service_by_name(dependency._to)
          if not service:
              service = Service.create_service(dependency._to, "", ())
          dependency.set_instance_of_to(service)
          dependency.set_instance_of_from(self)
          service.add_reffered_from(dependency)
          self.dependencies.append(dependency)

  def most_longname_service(self):
      most_long = self
      if self.children:
          for s in self.children:
              if len(s.name) > len(most_long.name): 
                  most_long = s
      return most_long

  @classmethod
  def find_service_by_name(cls, name,
                           service_type=SERVICE_TYPE_COMPONENT):
      for service in cls.SERVICE_LIST:
          if service.name == name and\
              service.service_type == service_type:
              return service
      return None

  
  @classmethod
  def create_service(cls,  name, description, dependencies, service_type="component"):
      service = Service.find_service_by_name(name, service_type)
      if service:
          service.description = description
          service.resolve_dependencies(dependencies)
      else:
          service = Service(name, description, dependencies, service_type)
      return service 
