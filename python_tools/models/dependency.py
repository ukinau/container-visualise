import re


class Dependency():

    def __init__(self, _from, _to, opts = None):
        self._to = _to
        self._from = _from
        self.operation = None
        self.topics = []
        if opts:
            self.operation = opts['op']
            self.topics = opts['topics']

    def set_instance_of_to(self, service):
        self.to_instance = service

    def set_instance_of_from(self, service):
        self.from_instance = service

    # COMPONENT:OP(TOPIC1)(TOPIC2)
    @classmethod
    def parse_depenencies_op_topic(cls, dependencies_str):
        splited = dependencies_str.split(':')
        stripped_component = ":".join(splited[1:])
        if len(stripped_component) == 1:
            return (None, None)
        op_array = re.findall(r'(^.*?)\(', stripped_component)
        if len(op_array) == 0:
            return (None, None)
        op = op_array[0]
        topics = re.findall(r'\((.*?)\)', stripped_component)
        if op and len(topics) > 0:
            return (op, topics)
        else:
            return (None, None)

    @classmethod
    def parse_depenencies(cls, src, dependencies_str):
        dependencies = list()
        dependencies_str = dependencies_str.replace('\n', ' ')
        for dep_definition in dependencies_str.split(' '): 
            if dep_definition != ' ' and dep_definition != '':
                dep_name = dep_definition.split(':')[0]
                op, topics = Dependency.parse_depenencies_op_topic(dep_definition)
                if op and topics:
                    dep = Dependency(src, dep_name, {'op': op, 'topics': topics})
                else:
                    dep = Dependency(src, dep_name)
                dependencies.append(dep) 
        return dependencies
