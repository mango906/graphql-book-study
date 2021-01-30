## 스키마 설계하기

API에 반환할 데이터 타입의 집합을 **스키마** 라고 부른다.

**스키마 우선주의** 란 디자인 방법론을 통해 백엔드 팀은 스키마를 보고 어떤 데이터를 저장하고 전달해야 하는지 정확히 이해할 수 있고, 프론트엔드 팀은 사용자 인터페이스 작업을 할 때 필요한 데이터를 정의할 수 있다.

GraphQL은 스키마 정의를 위해 SDL(Schema Definition Language)를 지원한다.

### 4.1 타입 정의하기

#### 타입

타입은 GraphQL의 핵심 단위이다. GraphQL에서 타입은 커스텀 객체이며 이를 통해 애플리케이션의 핵심 기능을 알 수 있다. 

타입에는 **필드** 가 들어간다. 각각의 필드는 특정 종류의 데이터를 반환한다. 

스키마에는 타입 정의를 모아둔다. 스키마는 자바스크립트 파일에 문자열로 작성하거나, 따로 텍스트 파일로 작성해 둘 수도 있다. 텍스트 파일의 주요 확장자는 .graphql이다.

```graphql
type Photo {
	id: ID!
	name: String!;
	url: String!;
	description: String
}
```

이렇게 Photo 타입을 직접 만들어 보았는데, GraphQL에서는 이런 커스텀 타입 뿐만 아니라 스칼라 타입도 내장되어 있다. 필드에 붙은 느낌표는 **null 값을 허용하지 않음**을 뜻한다. 

ID 스칼라 타입은 고유 식별자 값이 반환된다. id 필드 반환 값은 문자열 타입이지만, 고유한 값인지 유효성 감사를 받는다.

#### 스칼라 타입

* Int
* Float
* String
* Boolean
* ID

스칼라 타입은 객체 타입이 아니기 때문에 필드를 가지지는 않는다. 

#### 열거 타입(Enum)

**열거 타입** 은 스칼라 타입에 속하며, 필드에서 반환하는 문자열 값을 세트로 미리 지정해 둘 수 있다. 미리 정의해 둔 세트에 속하는 값만 필드에서 반환하도록 만들고 싶다면 열거 타입을 사용하면 된다. 

```graphql
enum PhotoCategory {
	SELFIE
	PORTRAIT
	ACTION
	LANDSCAPE
	GRAPHIC
}
```

### 4.2 연결과 리스트

GraphQL 스키마 필드에서는 GraphQL 타입이 담긴 리스트도 반환할 수 있다. 리스트는 GraphQL 타입을 대괄호로 감싸서 만든다.

닫는 대괄호 다음에 느낌표를 쓰면 필드에서 null 값을 반환할 수 없음을 뜻한다.

느낌표가 닫는 대괄호 앞에 오면 리스트에 담긴 값 자체가 null 값이 될 수가 없음을 뜻한다.

* `[Int]`:  리스트 안에 담긴 정수 값은 null이 될 수 있다.
* `[Int!]`:  리스트 안에 담긴 정수 값은 null이 될 수 없다
* `[Int]!`:  리스트 안에 담긴 정수 값은 null이 될 수 있으나, 리스트 자체는 null이 될 수 없다.
* `[Int!]!`: 리스트 안의 정수 값은 null이 될 수 없고, 리스트 자체도 null이 될 수 없다.

#### 일대일 연결

커스텀 객체 타입으로 필드를 만들면 두 객체가 서로 연결된다. 그래프 이론에 의하면 두 객체 사이의 연결, 혹은 링크를 일컬어 **엣지** 라고 한다.

일대일 연결은 하나의 객체 타입이 또 다른 객체 타입과 서로 연결된다.

```graphql
type User {
	githubLogin: ID!
	name: String
	avatar: String
}

type Photo {
	id: ID!
	name: String!
	url: String!
	description: String
	created: DateTime!
	category: PhotoCategory!
	postedBy: User! <=
}
```





#### 일대다 연결

일대다 관계는 어떤 객체의 필드(부모)에서 다른 객체 리스트(자식)를 반환하는 필드를 보유하고 있을 때 나타나는 관계이다.

#### 다대다 연결

가끔 노드 리스트를 다른 노드 리스트와 연결지어야 할 때가 있다. 이럴때 다대다 연결 관계를 사용하면 된다.

하나의 다대다 관계는 두 개의 일대다 관계로 이루어져 있다,

#### 여러 타입을 담는 리스트

##### 유니언 타입

GraphQL **유니언 타입** 을 사용하면 여러 타입 가운데 하나를 반환할 수 있다. 

```graphql
union AgendaItem = StudyGroup | WorkOut

type StudyGroup {
	subject: String
	students: [User!]!
}

type WorkOut {
	name: String!
	reps: Int!
}

type Query {
	agenda: [AgendaItem!]!
}
```

유니언 타입에 타입을 원하는 만큼 결합할 수 있다. 각 타입 사이에 파이프(|)를 넣어 구분하면 된다.

##### 인터페이스

**인터페이스** 역시 한 필드 안에 타입을 여러 개 넣을 때 사용한다. 스키마 코드의 구조를 조직할 때 아주 좋은 방법이다.

```graphql
interface AgendaItem {
	name: String!
	start: DateTime!
	end: DateTime!
}

type StudyGroup implements AgendaItem {
	...
	// 실질적으로 요 필드들도 포함되어 있다.
  name: String!
	start: DateTime!
	end: DateTime!
}
```

### 4.3 인자 

GraphQL 필드에는 인자를 추가할 수 있다. 인자를 사용하면 데이터를 전달할 수 있기 때문에 GraphQL 요청 결과 값이 바뀔 수 있다.

```graphql
type Query {
	...
	User(githubLogin: ID!): User!
}
```

필드처럼 인자도 타입이 었어야 한다. 스키마 처럼 스칼라 타입이나 객체 타입으로 인자의 타입을 정해주면 된다.

#### 데이터 페이징

데이터가 많이 쌓이게 될 경우, 모든 요청마다 모든 데이터를 응답으로 내려주긴 힘들것이다. (속도나, 성능 측면에서) 

GraphQL 쿼리에 인자를 추가해서 반환 데이터의 양을 조절할 수 있다. 이를 **데이터 페이징** 이라고 한다.

데이터 페이징 기능을 추가하려면 옵션 인자를 두 개 더 써야한다. `first` 인자는 데이터 페이지 한 장 당 들어가는 레코드 수를 지정하기 위해 사용하고, `start` 는 첫 번째 레코드가 시작되는 인덱스, 즉 시작 위치 값을 지정하기 위해 사용한다.

```graphql
type Query {
	...
	allUsers(first: Int=50 start: Int=0): [User!]!
}
```

#### 정렬

데이터 리스트가 반환되는 쿼리를 작성할 때는 리스트의 정렬 방식을 지정할 수 있다. 이떄도 인자를 사용한다.

```graphql
enum SortDirection {
	ASCENDING
	DESCENDING
}

enum SortablePhotoField {
	name
	description
	category
	created
}

Query {
	allPhotos(
		sort: SortDirection = DESCENDING
		sortBy: SortablePhotoField = created
	): [Photo!]!
}
```

이와 같이 하면 생성일 필드 기준으로 내림차순 정렬한 사진 리스트가 반환된다.

### 4.4 뮤테이션

뮤테이션은 반드시 스키마 안에 정의해 두어야 한다. 쿼리를 정의할 때처럼 커스텀 타입으로 정의한 다음에 스키마에 추가한다. 

```graphql
type Mutation {
	postPhoto(
		name: String!
		description: String
		category: PhotoCategory = PORTRAIT
  ): Photo!
}

schema {
	query: Query
	mutation: Mutation
}
```

### 4.5 인풋 타입

인풋 타입을 사용하면 인자 관리를 조금 더 체계적으로 할 수 있다. 인풋 타입은 GraphQL 객체 타입과 비슷하나, 인풋 타입은 인자에서만 쓰인다.

```graphql
input PostPhotoInput {
	name: String!
	description: String
  category: PhotoCategory = PORTRAIT
}

type Mutation {
	postPhoto(input: PostPhotoInput!): Photo!
}

mutation newPhoto($input: PostPhotoInput!) {
	postPhoto(input: $input) {
		id
		url
		created
	}
}
```

인풋 타입으로 정렬 및 필터링 필드와 관련된 코드 구조도 쳬계화하고, 재사용 할 수 있다.

### 4.6 리턴 타입

페이로드 데이터 말고도 쿼리나 뮤테이션에 대한 정보나 기타 데이터를 리턴하고 싶을 때 리턴타입을 선언해 주면 된다.

```graphql
type AuthPayload {
	user: User!
	token: String!
}

type Mutation {
	...
	githubAuth(code: String!): AuthPayload!
}
```

### 4.7 서브스크립션

Subscription 타입은 GraphQL 스키마 정의 언어에 존재하는 다른 타입과 별반 차이가 없다.

```
type Subscription {
	newPhoto: Photo!
	newUser: User!
}

schema {
	query: Query
	mutation: Mutation
	subscription: Subscription
}
```

### 4.8 스키마 문서화

GraphQL 스키마를 작성할 때는 옵션으로 각 필드에 대한 설명을 적어넣을 수 있다. 이로써 스키마 타입과 필드에 대한 부가정보를 제공할 수 있다. 설명을 잘 적어두면 API 사용자들이 스키마를 이해하는데 도움이 될 것이다.



```graphql
"""
깃허브에서 한 번 이상 권한을 부여받은 사용자
"""
type User {
	"""
	사용자의 깃허브 로그인 ID
	"""
	githubLogin: ID!
}
```

주석 위, 아래로 인용 부호를 붙여 각 타입 혹은 필드에 추가하면 된다. 타입과 필드뿐만 아니라 인자도 문서화 할 수 있다.

```graphql
typ Mutation {
	"""
	깃허브 사용자 권한 부여
	"""
	githubAuth(
		"사용자 권한 부여를 위해 깃허브에서 받아 온 유니크 코드"
		code: String!
	): AuthPayload!
}
```

주석은 GraphQL 플레이그라운드 혹은 GraphiQL툴의 스키마 문서에도 나오게 된다. 