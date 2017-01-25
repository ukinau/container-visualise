# Docker compose container visualisation tools

## 1. Sample

Sample diagram by using heroku

[https://container-visualise.herokuapp.com/index.html](https://container-visualise.herokuapp.com/index.html)
![released](samples/container_visualise_1.0.gif)


## 2. How to use it
### 0. git clone

```
$ git clone https://github.com/ukinau/container-visualise.git
```

### 1. Directory Tree

```
├── base_compose_files    (you need to put docker-compose.yaml file into this directory)
│   ├── test-service.yaml (which is displayed always top. the component everyone used should be here like mysql/kafka)
│   └── test.yaml         (the component each team has should be here)
├── create_data.py        (This is comand line tools to generate graph data based on docker-compose.yaml)
├── python_tools          (internal used to store the dependencies program of **create_data.py**)
├── data   (internal used to store the graph data)
├── js     (to display graph)
|__ test.html (html file)

```

### 2. Put your docker-compose.yaml into **base_compose_files**

#### 2.1 This program require two types of docker-compose.yaml to display properly.
The graph is generated based on following rules.

```
canvas
 _________________________
|
|   <team1 of test-service.yaml>  <team2 of test-service.yaml> ....
|
| <team1 of test.yaml> <team2 of test.yaml> ....
 __________________________
```

1. test-service.yaml

 - I reccomend you to describe the common containers many people across team used like Mysql, Kafka

2. test.yaml

 - I reccomend you to describe the constainer each team is developping


#### 2.2 The Additional information for graph


```
  <ContainerName>:
    labels:
      com.microservice.team: "devteamA"
      com.microservice.component: "Payment"
      com.microservice.description: |
        Sample.  This is for payment related container
      com.microservice.depends: |
        PaymentHistoryDump:REST(/); RabbitMq:SUB(notify);
        Redis:READ(schedules:*)(test:*);WRITE(test:*);

```

- **\<domain\>.team**
  - This is outest block
- **\<domain\>.component**
  - This is sencond level block, which means all component are enclosed in one of the teams
- **\<domain\>.description**
  - This should be described about short description about this container
- **\<domain\>.depends**
  - This should be described about the dependencies as a yaml string
  - Sample depends definition
```
ComponentName:
  Operation1: ["topic1", "topic2"]
Mysql:
  READ: ["TestDB"]
  WRITE: ["TestDB"]
Kafka:
  PUB: ["testA"]
  SUB: ["testB"]
```

### 3. Generate graph data

```
$ python create_data.py --data-output
```

![released_create_data](samples/container_visualise_0.5_create_data.gif)
