## GraphQL 쿼리어

SQL(구조화된 쿼리 언어)은 데이터베이스 안의 데이터에 접근하거나, 데이터를 관리하거나 조작하는 데 사용한다. SQL 명령어로 CRUD(Create, Read, Update, Delete)가 가능하다.

SQL처럼 GraphQL 쿼리도 데이터를 변경하거나 삭제할 때 사용한다. SQL의 QL과 GraphQL의 QL 모두 쿼리 언어(Query Language)라는 뜻이다.

GraphQL과 SQL 둘 다 쿼리 언어이지만, 사용 환경이 다르다. SQL 쿼리는 데이터베이스로 보내는 반면, GraphQL 쿼리는 API로 보낸다. 

GraphQL에선 `SELECT` 대신 `Query` 를 사용해 데이터 요청을 보낸다. `INSERT`, `UPDATE`, `DELETE` 대신 GraphQL은 `Mutation` 을 통해 데이터 타입을 조작한다. 소켓 연결로 전달되는 데이터 변경 사항을 감지할 수 있는 `Subscription` 도 존재한다. 

쿼리는 단순한 문자열로, Post 요청 본문에 담겨 GraphQL 엔드포인트로 보내진다. GraphQL은 다음과 같이 생겼다.

```graphql
{
	allLifts {
		name
	}
}
```

GraphQL 스키마가 위와 같은 형태의 쿼리를 처리할 수 있다면, JSON 응답 내용이 리턴된다. JSON 응답에는 `data` 필드안에 요청한 데이터가 들어가고, 무언가 잘못되었다면 `errors` 필드안데 들어가있다. 요청을 하나만 보내기 때문에 응답도 하나만 받는다.

데이터를 수정하려면 **뮤테이션**(mutation)을 사용하면 된다. 쿼리와 뮤테이션은 비슷하게 생겼으나, 뮤테이션은 데이터를 수정하고자 하는 의도로 사용된다.

```graphql
mutation {
	setLiftStatus(id: "panorama" status: OPEN){
		name
		status
	}
}
```

### 3.1 GraphQL API 툴

* GraphiQL
* GraphQL Playground
* 공용 GraphQL API
  * [SWAPI](https://swapi.dev/)
  * [GitHub API](https://docs.github.com/en/graphql)
  * [Yelp](https://www.yelp.com/login?return_url=%2Fdevelopers%2Fgraphiql)

### 3.2 GraphQL 쿼리

**쿼리** 작업으로 API에 데이터를 요청할 수 있다. 쿼리 안에는 GraphQL 서버에서 받고 싶은 데이터를 써 넣는다.쿼리를 보낼 때는 요청 데이터를 **필드**로 적어 넣는다. 필드는 서버에서 받아오는 JSON 응답 데이터의 필드와 일치한다.

```graphql
query {
	allLifts {
		name
		status
	}
}
```

쿼리 문서에는 쿼리를 여러 개 추가할 수도 있다.

```graphql
query liftsAndTrails {
	liftCount(status: OPEN)
	allLifts {
		name
		status
	}
	allTrails {
		name
		difficulty
	}
}
```

쿼리 한 번에 여러 종류의 데이터를 모두 받을 수 있다.

Query는 GraphQL 타입이다. 이는 **루트 타입** 이라고도 하는데, 타입 하나가 하나의 작업을 수행하며, 작업이 곧 쿼리 문서의 루트를 의미하기 때문이다. 

쿼리를 작성할 때는 필요한 필드를 중괄호로 감싼다. 이 중괄호로 묶인 블록을 **셀렉션 세트** 라고 부른다. 셀렉션 세트는 서로 중첩시킬 수 있다. 

쿼리에 대한 응답으로 돌아오는 JSON 객체는 쿼리의 필드명과 동일하다. 응답 객체의 필드명을 다르게 받고 싶다면, 아래와 같이 쿼리 안의 필드명에 별칭을 부여하면 된다.

```graphql
query liftsAndTrails {
	open: liftCount(status: OPEN)
	chairlifts: allLifts {
		liftName: name
		status
	}
}
```

GraphQL 쿼리 결과에 대한 필터링 작업을 하고 싶다면 **쿼리 인자** 를 넘기면 된다. 쿼리 필드와 관련 있는 키-값 쌍을 하나 이상 인자로 넣을 수 있다.

```graphql
query closedLifts {
	allLifts(status: CLOSED) {
		name
		status
	}
}
```

#### 엣지와 연결

GraphQL 쿼리어에서 필드는 **스칼라 타입** 과 **객체 타입** 둘 중 하나에 속하게 된다. 스칼라 타입은 다른 프로그래밍 언어의 원시 타입과 비슷하다. GraphQL에는 다섯 가지 스칼라 타입이 내장되어 있다. 

* 정수 (Int)
* 실수 (Float)
* 문자열 (String)
* 불 (Boolean)
* 고유 식별자  (ID)

ID는 유일한 문자열을 반환하도록 되어있다.

특정 객체가 있을 때, 객체의 세부 정보를 얻어내는 쿼리를 작성하면 세부 정보를 얻어낼 수 있다.

```graphql
query trailsAccessedByJazzCat {
	Lift(id: "jazz-cat") {
		capacity
		trailAccess {
			name
			difficulty
		}
	}
}
```

#### 프래그먼트

GraphQL 쿼리 안에는 각종 작업에 대한 정의와 **프래그먼트** 에 대한 정의가 들어갈 수 있다. 프래그먼트는 셀렉션 세트의 일종이며, 여러번 재사용할 수 있다. 셀렉션 세트 안에 프래그먼트를 다른 필드와 함께 쓸 수도 있고, 같은 타입에 대한 프래그먼트를 여러 개 쓸 수도 있다.

```graphql
fragment liftInfo on Lift {
	name
	status
	capacity
	night
	elevationGain
}

query {
	Lift(id: "jazz-cat"){
		...liftInfo
		trailAccess {
			name
			difficulty
		}
	}
}
```

한 차례의 수정으로 여러 쿼리의 셀렉션 세트를 한 번에 바꿀 수 있다는 것이 프래그먼트의 장점이다.

#### 유니언 타입

타입 여러 개를 한번에 리스트에 담아 반환하고 싶다면 **유니언 타입**을 만들면 된다. 두 가지의 타입을 하나의 집합으로 묶는 것이다.

#### 인터페이스

**인터페이스**는 필드 하나로 객체 타입을 여러 개 반환할 떄 사용한다.

### 3.3 뮤테이션

쿼리는 "읽기"에 해당한다면 데이터를 쓰고, 수정하고, 삭제하려면 **뮤테이션** 을 사용해야 한다. 뮤테이션하는 방법은 쿼리를 작성하는 방법과 비슷하며, 이름을 붙여야 한다. 쿼리와 다른 점으로는 백엔드 데이터에 영향을 준다는 것이다.

```graphql
mutation closeLift {
	setLiftStatus(id: "jazz-cat", status: CLOSED) {
		name
		status
	}
}
```

#### 쿼리 변수 사용하기

쿼리 안에 변수를 넣어 동적인 값을 넣을 수 있다. 변수명 앞에는 $ 문자가 붙는다.

```graphql
mutation createSong($title: String! $numberOne: Int $by: String!){
	addSong(title: $title, numberOne: $numberOne, performerName: $by){
		id
		title
		numberOne
	}
}
```

### 3.4 서브스크립션

**서브스크립션** 은 실시간으로 데이터를 받아야 할 때 유용하게 사용할 수 있다. (실제로 페이스북에서 실시간 좋아요 기능을 개발하기 위해 만들어졌다고 한다.)

```graphql
subscription {
	liftStatusChange {
		name
		capacity
		status
	}
}
```

서브스크립션 요청을 실행 한다고 바로 응답이 오지는 않는다. 서브스크립션 요청이 서버로 전송되면 받는 쪽에서 데이터의 변경 사항 여부를 듣기 시작할 뿐이다.

뮤테이션으로 데이터를 바꾼다면 서브스크립션 중인 곳으로도 변경된 데이터에 대한 응답이 올 것이다.

### 3.5 인트로스펙션

**인트로스펙션**을 사용하면 현재 API 스키마의 세부 사항에 관한 쿼리를 작성할 수 있다.

인트로스펙션 쿼리를 사용하면 주어진 API 스키마를 통해 어떤 데이터를 반환받을 수 있는지 조사할 수 있다. __schema 쿼리를 실행하여 받을 수 있다.

```grapnel
query {
	__schema {
		types {
			name
			description
		}
	}
}
```

이 쿼리를 실행하면 API에서 사용할 수 있는 타입을 모두 볼 수 있다. 

### 3.6 추상 구문 트리

GraphQL API로 쿼리를 보낼 떄, 쿼리 문서 문자열은 추상 구문 트리로 파싱되어 명령 실행 전 유효성 검사를 거친다.

첫 번쨰로 거치는 작업은 문자열을 더 작은 여러 개의 조각으로 쪼개어 분석하는 작업이다. 이를 **어휘화** 또는 **어휘 분석** 이라고 한다. 

GraphQL은 AST(추상 구문 트리)를 횡단하며 GraphQL 언어와 현재 스키마와 비교해 유효성 검사를 실시한다. 쿼리 구문에 오류가 없다면 작업이 실행된다.