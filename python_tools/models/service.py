
class Service(object):
  SERVICE_LIST = list()
  def __init__(self, name, description, dependencies):
      self.name = name
      self.description = description
      self.dependencies = list()
      self.reffered_from = list()
      self.resolve_dependencies(dependencies)
      self.key = "sv" + str(len(Service.SERVICE_LIST))
      Service.SERVICE_LIST.append(self)
      self.drawable = None

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

  @classmethod
  def find_service_by_name(cls, name):
      for service in cls.SERVICE_LIST:
          if service.name == name:
              return service
      return None
  
  @classmethod
  def create_service(cls,  name, description, dependencies):
      service = Service.find_service_by_name(name)
      if service:
          service.description = description
          service.resolve_dependencies(dependencies)
      else:
          service = Service(name, description, dependencies)
      return service 
