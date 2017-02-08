import uuid
class ServiceGroup(object):
  LIST = list()
  def __init__(self, name, description=""):
    self.name = name
    self.children = list()
    self.key = "sg"+str(uuid.uuid4())
    self.description = description
    ServiceGroup.LIST.append(self)
    self.drawable = None

  def add_chidren(self, service):
      service.parent = self
      self.children.append(service)

  def remove_child_by_key(self, key):
      for i, sv in enumerate(self.children):
          if sv.key == key:
              del self.children[i]
              return True
      return False

  def most_longname_service(self):
      most_long = self
      if self.children:
          for s in self.children:
              if len(s.name) > len(most_long.name):
                  most_long = s
      return most_long

  def get_x_cordinate_of_rightest_service(self):
      rightest_cordinate = 0
      for sv in self.children:
          loc = sv.drawable['loc'].split(' ')
          x = float(loc[0]) + float(sv.drawable['width']) 
          if x > rightest_cordinate:
              rightest_cordinate = x
      return rightest_cordinate

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
