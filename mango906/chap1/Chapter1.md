## 1장 GraphQL에 오신 것을 환영합니다.



### 1.1 GraphQL 이란?

GraphQL은 API를 만들 때 사용할 수 있는 쿼리 언어이다. 쿼리에 대한 데이터를 받을 수 있는 런타임이기도 하다.

GraphQL 쿼리는 실제로 필요한 데이터만 받도록 작성할 수 있다.

아래는 GraphQL 쿼리의 예시이다. 

```javascript
// request
query {
  person(personID: 5) {
    name
		birthYear
    created
  }
}

// response
{
  "data": {
    "person": {
      "name": "mango906",
      "birthYear": "2001",
      "created": "2021-01-10T21:08:00+09:00"
    }
  }
}
```

다섯 번째 사람 (personID:5)을 받아보고 싶다는 요청을 보냈기 때문에 mango906 이라는 유저에 대한 저옵를 받았다. 요청한 데이터 필드는 `name`, `birthday`, `created` 이 세 가지이다. 응답값을 살펴보면 JSON 데이터의 형태가 쿼리문이 요청한 형태와 일치한다.



쿼리문을 중첩하여 실행하면 연관된 객체를 응답 데이터로 같이 받을 수 있다. HTTP 요청 하나만으로 데이터 타입 두 가지에 대한 응답을 얻을 수 있다. 얻으려는 타입에 원치 않는 데이터가 포함되어 있다면, 이를 제외해도 된다. 클라이언트에서 GraphQL을 사용하면 요청 한번에 필요한 데이터를 모두 받을 수 있다. (하나의 엔드포인트로 관리한다는게 GraphQL의 장점)

```javascript
// request
query {
  person(personID: 5) {
    name
    birthYear
    created
    filmConnection {
      films {
        title
      }
    }
  }
}

// response
{
  "data": {
    "person": {
      "name": "mango906",
      "birthYear": "2001",
      "created": "2021-01-10T21:18:00+09:00",
      "filmConnection": {
        "films": [
          {
            "title": "title1"
          },
          {
            "title": "title2"
          }
        ]
      }
    }
  }
}
```



GraphQL 서버에서는 쿼리가 실행될 때 마다 타입 시스템에 기초해 쿼리가 유효한지 검사한다. 앞에서 만든 인물 쿼리는 다음과 같은 Person 객체를 바탕으로 작성되었다.

```typescript
type Person {
  id: ID!
	name: String
  birthYear: String
  eyeColor: String
  gender: String
  hairColor: String
  height: Int
  mass: Float
  skinColor: String
  homeworld: Planet
  species: Species
  filmConnection: PersonFilmsConnection
}
```

참고: [GraphQL 스키마 & 타입](https://graphql-kr.github.io/learn/schema/)

Person 타입에는 모든 필드가 각 필드의 타입과 함께 정의되어 있다.

#### GraphQL 설계 원칙

GraphQL API 작성법에 제한은 없으나 GraphQL 서비스를 만들 때 고려해야 할 지침이 몇가지 있다.

**위계적**

GraphQL 쿼리는 위계성을 띠고 있다. 필드 안에 다른 필드가 중첩될 수 있으며, 쿼리와 그에 대한 반환 데이터는 형태가 서로 같다.

**제품 중심적** 

GraphQL은 클라이언트가 요구하는 데이터와 클라이언트가 지원하는 언어 및 런타임에 맞춰 동작한다.

**엄격한 타입 제한**

GraphQL 서버는 GraphQL 타입 시스템을 사용한다. 스키마의 데이터 포인트마다 특정 타입이 명시되며, 이를 기초로 유효성 검사를 받게 된다.

**클라이언트 맞춤 쿼리**

GraphQL 서버는 클라인트 쪽에서 받아서 사용할 수 있는 데이터를 제공한다.

**인트로스펙티브** (내향적? 자세한건 3장에서 다룸)

GraphQL 언어를 사용해 GraphQL 서버가 사용하는 타입 시스템에 대한 쿼리를 작성할 수 있다.

### 1.2 GraphQL의 탄생

GraphQL은 페이스북에서 만든 쿼리 언어이다. 

### 1.3 데이터 전송의 역사

**RPC**

RPC는 클라이언트에서 원격 컴퓨터로 요청 메시지를 보내 무언가를 하도록 만든다. 원격 컴퓨터는 클라이언트로 응답 메시지를 보낸다. 이때의 클라이언트와 서버는 지금과는 다른 컴퓨터지만 정보 전달 방식은 기본적으로 같다. 클라이언트가 서버로 데이터 요청을 보내고, 서버는 응답을 돌려준다.

**SOAP**

SOAP는 XML을 사용해 메시지를 인코딩하고 HTTP를 사용해 전송한다. SOAP에서는 타입 시스템도 사용하고 리소스 중심의 데이터 호출이라는 개념도 도입해 사용했다. SOAP를 사용하면 결과 값을 예측하기가 상당히 쉬우나, 구현하기가 꽤 복잡하다.

**REST**

사용자가 `GET`, `PUT`, `POST`, `DELETE` 와 같은 행동을 수행하여 웹 리소스를 가지고 작업을 진행하는 아키텍처이다. 리소스 네트워크는 **가상 상태 머신** 이며 행동(GET, PUT, POST, DELETE)은 머신 내의 상태를 바꾼다. 

RESTful 아키텍처에서 라우트는 정보를 나타내는 개념이다. 예를 들어 다음과 같은 각각의 라우터를 통해 정보를 요청하면 그에 따라 응답이 다르게 오게 된다.

`api/food/hot-dog`

`api/sport/skiing`

`api/city/Lisbon`

REST를 사용하면 데이터 모델의 엔드포인트를 다양하게 만들 수 있고, 이전의 아키텍처보다 개발하기 쉽다. 

### 1.4 REST의 단점

#### 오버페칭

필요하지 않는 데이터를 너무 많이 받아올 때, 이것을 **오버페칭**(overfetching) 이라고 한다. 

예를 들어, 클라이언트가 필요한 데이터 포인트는 세 개 뿐인데, 키가 16개나 되는 객체를 받는다면 나머지 13개의 데이터는 필요 없는데 네트워크로 전송되어 버릴 것이다. 

GraphQL 쿼리는 우리가 필요한 필드만 기재되어 있다. 그 후 응답값을 확인하면, 우리가 요청한 데이터만 들어있을 것이다. 쓸모없는 필드들은 들어 있지 않을것이다. 요청안에 필요한 데이터 형태를 써 두었기 때문에 그 형태 그대로 응답을 받았을 것이다. 불필요한 데이터를 가져오지 않았으므로 응답 속도 역시 빨라질 여지가 있다.

예시)

```typescript
// request
query {
  person(personID: 5) {
    name
		birthYear
    created
  }
}

// response
{
  "data": {
    "person": {
      "name": "mango906",
      "birthYear": "2001",
      "created": "2021-01-10T22:14:00+09:00"
    }
  }
}

type Person {
  id: ID!
	name: String
  birthYear: String
  eyeColor: String
  gender: String
  hairColor: String
  height: Int
  mass: Float
  skinColor: String
  homeworld: Planet
  species: Species
  filmConnection: PersonFilmsConnection
  ...
}
```

#### 언더페칭

새로운 기능을 추가한다고 가정해보자. 이름, 신장, 몸무게뿐 아니라 등장인물이 등장한 모든 영화의 제목이 담긴 목록을 화면에 노출하는 기능을 말이다. 그렇다면 우리는 등장인물에 대한 정보를 가져오는 요청을 한 후, 추가 데이터를 또 요청해야 할 것이다. 이를 **언더페치**(underfetch)되었다고 표현한다.

모든 영화 제목을 얻으려면 영화 배열에 담긴 각각 라우트에서 데이터를 가져와야 한다.

```typescript
"films": [
  "https://api/films/2",
  "https://api/films/3"
  "https://api/films/4"
]
```

이 데이터를 얻으려면 등장인물에 대한 정보를 한번 보내고, 각 영화에 대한 요청을 3번 더 보내야 한다. 영화 정보는 또 다른 큰 객체에 담겨 있는데, 이 객체에서 필요한 값은 오직 하나라면 낭비일 것이다. 이 때문에 사용자 체감 속도가 느려질 것이다.

아래와 같이 쿼리를 한다면 요청 한번에 필요한 데이터를 모두 받아 올 수 있다. 그리고 계속 말했듯이, 요청 형태와 반환되는 데이터의 형태가 같다.

```typescript
// request
query {
  person(personID: 5) {
    name
    birthYear
    created
    filmConnection {
      films {
        title
      }
    }
  }
}

// response
{
  "data": {
    "person": {
      "name": "mango906",
      "birthYear": "2001",
      "created": "2021-01-10T21:18:00+09:00",
      "filmConnection": {
        "films": [
          {
            "title": "title1"
          },
          {
            "title": "title2"
          }
        ]
      }
    }
  }
}
```

참고: [Over-fetching과 Under-fetching](https://ivvve.github.io/2019/07/24/server/graphql/over-under-fetching/)

#### REST 엔드포인트 관리

REST API에 대한 단점은 유연성이 부족하다는 것이다. 클라이언트에 변경사항이 생기면 엔드포인트를 새로 만들어야 하는데, 이렇게 되면 엔드포인트의 개수가 몇배로 빠르게 늘어난다. 

큰 규모의 서비스에선 API를 사용하려면 수많은 라우트로 요청을 날려야 한다. 그래서 보통 HTTP 요청을 최소화하고자 커스텀 엔드포인트를 사용한다. 

GraphQL을 사용하면 설계상 엔드포인트가 보통 하나로 끝나게 된다. 단일 엔드포인트가 게이트웨이로써 몇 가지 데이터 소스를 조율하는 역할을 하게 되고, 데이터 체계 역시 손쉽게 관리된다.