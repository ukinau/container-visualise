import yaml
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

    @classmethod
    def parse_depenencies_op_topic(cls, dependencies_info):
        """
        Args:
            dependencies_info(dict):
                {<operation>: ["topic", "topic"]}
        Return:
            result(list<tuple>):
                [(operation, topic), (op, topic)]
        """
        result = []
        for op, topics in dependencies_info.iteritems():
            for topic in topics:
                result.append((op, topic))
        return result

    @classmethod
    def parse_depenencies(cls, src, dependencies_str):
        """
        Args:
            src(string): source component name of dependency
            dependencies_str(string): dependency definition represented as yaml
        Return:
            result(list<Dependency>)
        """
        dependencies = list()
        dependencies_parsed = {}
        try:
            dependencies_parsed = yaml.load(dependencies_str)
        except Exception as e:
            print e

        if not dependencies_parsed:
            return []

        for dep_name, info in dependencies_parsed.iteritems():
            if info:
                topics = Dependency.parse_depenencies_op_topic(info)
                dep = Dependency(src, dep_name, {'topics': topics})
            else:
                dep = Dependency(src, dep_name)
            dependencies.append(dep)
        return dependencies
