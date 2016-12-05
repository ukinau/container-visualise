
class ServiceGroup(object):
  LIST = list()
  def __init__(self, name, description=""):
    self.name = name
    self.children = list()
    self.key = "sg"+str(len(ServiceGroup.LIST))
    self.description = description
    ServiceGroup.LIST.append(self)
    self.drawable = None

  def add_chidren(self, service):
      self.children.append(service)

  def most_longname_service(self):
      most_long = self
      if self.children:
          for s in self.children:
              if len(s.name) > len(most_long.name):
                  most_long = s
      return most_long

  @classmethod
  def create(cls, name):
    sg = ServiceGroup.find(name)
    if sg:
      return sg
    else:
      sg = ServiceGroup(name)
    return sg

  @classmethod
  def find(cls, name):
    for sg in cls.LIST:
      if sg.name == name:
        return sg
    return None
