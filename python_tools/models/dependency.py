import re


class Dependency():

    def __init__(self, _from, _to, opts = None):
        self._to = _to
        self._from = _from
                    # [(OP, topic), (READ, test-topic)]
        self.topics = []
        if opts:
            self.topics = opts['topics']

    def set_instance_of_to(self, service):
        self.to_instance = service

    def set_instance_of_from(self, service):
        self.from_instance = service

    # COMPONENT:OP(TOPIC1)(TOPIC2);OP1(TOPICA);
    @classmethod
    def parse_depenencies_op_topic(cls, dependencies_str):
                # [(op, topic), (op. topic)]
        result = list()
        splited = dependencies_str.split(':')
        stripped_component = ":".join(splited[1:])
        if len(stripped_component) == 1:
            return (None, None)
        # In : RW(topics);READ(topics1)(topics2);
        # Out: ("RW(topics)", "READ(topics1)(topics2)")
        op_topics_array = re.findall(r'(.*?\));', stripped_component)

        for op_topics in op_topics_array:
            # In : READ(topics1)(topics2)
            # Out: ("READ")
            op_array = re.findall(r'(^.*?)\(', op_topics)
            if len(op_array) == 0:
                continue
            op = op_array[0]
            # In : READ(topics1)(topics2)
            # Out: ("topics1", "topics2")
            topics = re.findall(r'\((.*?)\)', op_topics)
            for topic in topics:
                result.append((op, topic))

        return result
    @classmethod
    def parse_depenencies(cls, src, dependencies_str):
        dependencies = list()
        dependencies_str = dependencies_str.replace('\n', ' ')
        for dep_definition in dependencies_str.split(' '): 
            if dep_definition != ' ' and dep_definition != '':
                dep_name = dep_definition.split(':')[0]
                topics = Dependency.parse_depenencies_op_topic(dep_definition)
                if len(topics) > 0:
                    dep = Dependency(src, dep_name, {'topics': topics})
                else:
                    dep = Dependency(src, dep_name)
                dependencies.append(dep) 
        return dependencies
