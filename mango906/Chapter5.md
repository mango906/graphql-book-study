## GraphQL API 만들기

### 5.1 프로젝트 세팅

프로젝트 폴더에 `npm init -y` 명령어를 입력해 npm 프로젝트를 새로 만든다. -y 플래그를 사용하였기 때문에 기본적인 옵션 값이 자동으로 들어간 `package.json` 파일이 생성된다.

프로젝트에 사용할 의존 모듈인 apollo-server, graphql, nodemon도 설치한다.

```zsh
$ npm install apollo-server graphql nodemon
```

apollo-server와 graphql을 설치해야 아폴로 서버 인스턴스를 설정할 수 있다. nodemon은 파일에서 바뀐 부분이 있을 때 서버를 재시작해준다. `package.json` 파일 안에 `scripts `필드의 키 값으로 nodemon 관련 명령어를 작성해보자.

```json
"scripts": {
  "start": "nodeman -e js,json,graphql"
}
```

### 5.2 리졸버

**리졸버**는 특정 필드의 데이터를 반환하는 함수이다. 스키마에 정의된 타입과 형태에 따라 데이터를 반환한다. 비동기로 작성할 수 이쓰며 REST API, 데이터베이스, 혹은 기타 서비스의 데이터를 가져오거나 업데이트 작업을 할 수 있다.

```javascript
const typeDefs = `
	type Query {
		totalPhotos: Int!
	}
`

const resolvers = {
  Query: {
    totalPhotos: () => 42
  }
}
```

 typeDefs 변수에 스키마를 문자열 형태로 정의한다. totalPhotos 같은 쿼리를 작성하려면 쿼리와 같은 이름을 가진 리졸버 함수가 반드시 있어야 한다. 타입 정의하는 곳에 필드에서 반환하는 데이터 타입을 적는다.

리졸버 함수는 반드시 스키마 객체와 같은 typename을 가진 객체 아래에 정의해 두어야 한다. totalPhotos필드는 쿼리 객체에 속한다. 이 필드에 대응하는 리졸버 함수는 resolvers 객체의 Query안에 들어 있어야 한다.

스키마를 생성하고, 이에 관한 쿼리를 요청할 수 있는 환경을 갖추기 위해 아폴로 서버를 사용해보겠다.

```javascript
const { ApolloServer } = require('apollo-server')

const typeDefs = `
	type Query {
		totalPhotos: Int!
	}
`

const resolvers = {
  Query: {
    totalPhotos: () => 42
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers
})

server
  .listen()
  .then(({ url }) => console.log(`GraphQL Service running on ${url}`))
```

아폴로 서버를 reuire하고 나서 서버 인스턴스를 하나 생성한다. 그 다음 typeDefs와 resolvers를 객체로 묶어 서버에 인자로 넘긴다. 

이렇게 했다면 totalPhotos 쿼리 요청을 할 수 있다. `npm start` 명령어를 실행 후에 `http://localhost:4000` 에서 구동 중인 GraphQL 플레이그라운드에 접속해서, 다음 쿼리를 요청해보자



```graphql
// request
{
	totalPhots
}

// response
{
	"data": {
		"totalPhotos": 42
	}
}
```

#### 루트 리졸버

GraphQL API는 Query, Mutation, Subscription 루트 타입을 가진다. 이들을 통해 사용 가능한 모든 API 엔트리 포인트를 표현할 수 있다. 

Query를 만들어봤으니 이번엔 Mutation을 만들어보겠다. postPhoto라는 필드를 만들 텐데, String 타입인 name과 description을 인자로 받곘다. 요청 후에 반드시 Boolean을 반환하도록 했다.



```typescript
const photos = [];

const typeDefs = `
	type Query {
		totalPhotos: Int!
	}

	type Mutation {
		postPhoto(name: String! description: String): Boolean!
	}
`

const resolvers = {
  Query: {
    totalPhotos: () => photos.length
  },
  
  Mutation: {
    postPhoto: (parent, args) {
    	photos.push(args)
		  return true
  	}
  }
}

type Mutation {
  postPhoto(name: String! description: String): Boolean
}
```

이제 GraphQL 플레이그라운드에서 postPhoto 뮤테이션을 테스트 해보겠다. name 인자로 문자열을 보낸다.



```graphql
mutation newPhoto {
	postPhoto(name: "sample photo")
}
```

뮤테이션으로 인해 사진 정보가 배열에 추가되고 true가 반환된다. 변수를 사용할 수 있도록 뮤테이션을 수정해보자

```graphql
mutation newPhoto($name: String!, $description: String) {
	postPhoto(name: $name, description: $description)
}
```

쿼리에 변수를 추가했다면 문자열 변수에 값 데이터를 반드시 전달해주어야 한다.

#### 타입 리졸버

GraphQL 쿼리, 뮤테이션, 서브스크립션 작업 후 결과 값으로 반환되는 데이터의 형태는 쿼리의 형태와 동일하다. 리졸버 함수에서 정수, 문자열, Boolean 같은 스칼라 타입 값 말고도 객체 역시 반환할 수 있다.

```typescript
const typeDefs = `
	# 1. Photo 타입 정의를 추가한다.
	type Photo {
		id: ID!
		url: String!
		name: String!
		description: String
	}

	# 2. allPhotos에서 Photo 타입을 반환한다.
	type Query {
		totalPhotos: Int!
		allPhotos: [Photo!]!
	}

	# 3. 뮤테이션에서 새로 게시된 사진을 반환한다.
	type Mutation {
		postPhoto(name: String! description: String): Photo!
	}
`
```

```typescript
// 1. 고유 ID를 만들기 위해 값을 하나씩 증가시킬 변수이다.
let _id = 0
let photos = []

const resolvers = {
  Query: {
    totalPhotos: () => photos.length,
    allPhotos: () => photos
  },
  Mutation: {
    postPhoto (parent, args) {
      // 2. 새로운 사진을 만들고 id를 부여해준다.
      var newPhoto = {
        id: _id++,
        ...args
      }
      photos.push(newPhoto)
      
      // 3. 새로 만든 사진을 반환한다.
      return newPhoto
    }
  }
}
```

#### 인풋 & 열거 타입 사용하기

```typescript
enum PhotoCategory {
  SELFIE
  PORTRAIT
  ACTION
  LANDSCAPE
  GRAPHIC
}

type Photo {
	...
	category: PhotoCategory!
}


input PostPhotoInput {
  name: String!
  category: PhotoCategory=PORTRAIT
  description: String
}

type Mutation {
	postPhoto(input: PostPhotoInput!): Photo!
}
```

나머지 사용 방법은 위와 동일하다. 

#### 엣지와 연결

GraphQL의 진정한 강점은 데이터 포인트 사이를 잇는 연결 고리인 엣지에서 나온다. GraphQL 서버 관점에서 보통 타입은 모델에 해당한다. 타입 간의 관계를 정의할 때 사용하는 연결의 종류에 대해 알아보겠다.



**일대다 연결**

User 한명은 Photo를 여러 장 올릴 수 있기 때문에 이 두 타입 사이의 관계는 **일대다 관계**이다. 하나의 Photo는 User 한명에 의해 게시된 것이기 때문에 **일대일 연결** 관계이다.

**다대다 연결**

User 한 명이 여러 장의 사진에 태그될 수 있고, Photo 한 장에 여러 명의 User가 태그될 수 있다. 이러한 관계는 **다대다 관계**이다.

#### 커스텀 스칼라

4장에서 다루었듯이, GraphQL에는 모든 필드에 사용할 수 있는 기본적인 스칼라 타입이 있다. (Int, Float, String, Boolean, ID 등) 스칼라 타입은 대부분의 상황에서 사용할 수 있지만, 가끔 데이터 요구 사항에 맞추어 스칼라 타입을 직접 만들어야 할 때가 있다.

스칼라 타입을 직접 만들 때는 타입 직렬화와 유효성 검사 방식을 고려해야한다, DateTime 타입을 만드려고 한다면 유효한 DateTime에 대한 정의가 우선되어야 한다.

typeDefs에 직접 만든 DateTime 스칼라 타입을 추가하여 Photo 타입의 created 필드에서 사용한다. 

```typescript
const typeDefs = `
	scalar DateTime
	typePhoto {
		...
		created: DateTime!
	}
`
```

### 5.3 apollo-server-express

이미 실제 서비스 중인 앱에 아폴로 서버를 추가해야한다면, apollo-server-express가 하나의 선택지가 될 수 있다. 우선 apollo-server를 제거한다.

```zsh
$ npm remove apollo-server
```

`Index.js` 파일을 수정한다.

```typescript
// 1. `apollo-server-express`와 `express`를 require 한다.
const { ApolloServer } = require('apollo-server-express')
const express = require('express')

// 2. `express`를 호출하여 익스프레스 애플리케이션을 만든다.
var app = express()

const server = new ApolloServer({ typeDefs, resolvers })

// 3. `applyMiddleware()`를 호출하여 미들웨어가 같은 경로에 마운트되도록 한다.
server.applyMiddleware({ app })


// 4. 홈 라우트를 만든다.
app.get('/', (req, res) => res.send('PhotoShare API에 오신 것을 환영합니다'))

// 5. 특정 포트에서 리스닝을 시작한다.
app.listen({port: 4000}, () => console.log('GraphQL Server running @ http://localhost:4000${server.graphqlPath}'))
```

### 5.4 컨텍스트

컨텍스트에 전역으로 사용할 값을 저장해두면, 리졸버 함수에서 이 값에 접근할 수 있다. 컨텍스트에는 인증 정보, 데이터베이스 세부 정보, 로컬 데이터 캐시, 그 외 GraphQL 리졸버 기능에 필요한 모든 정보를 넣어 둘 수 있다.

리졸버 함수에서 REST API와 데이터베잇 호출을 직접 해도 되나, 일반적으로 이런 로직은 객체로 추상화하여 컨텍스트에 넣어둔다. 아폴로 데이터 소스에서 REST 데이터에 접근할 때도 컨텍스트를 활용할 수 있다.

지금은 앱에 내재된 몇 가지 문제점을 해결하기 위해 컨텍스트를 활용해보겠다. 첫 번째 문제는 데이터를 메모리에 저장하고 있어서 확장성이 매우 떨어진다. ID 값도 데이터 변형 시점에 하나씩 증가시키고 있으므로 좋은 방식이 아니다. 데이터베이스를 사용해 값을 저장하고 ID를 생성하도록 수정하겠다. 

#### MongoDB 설치하기

GraphQL은 데이터베이스 종류에 영향을 받지는 않는다. 

Mac에서 MongoDB를 사용하려면 일단 Homebrew가 있어야 한다. Homebrew는 [https;//brew.sh](https;//brew.sh) 에 들어가면 설치할 수 있다. Home-brew를 설치하고 나서 다음 명령어를 사용해 MongoDB를 설치한다.

```shell
$ brew tap mongodb/brew
$ brew install mongodb-community
$ brew services start mongodb-community
```

#### 컨텍스트에 데이터베이스 추가하기

이제 데이터베이스를 연결하고 컨텍스트도 연결한다. mongodb 패키지를 데이터베이스 통신용으로 사용한다. `npm install mongodb` 명령어로 패키지를 설치한다.

패키지 설치 후에는 아폴로 서버 설정 파일인 `index.js` 를 수정한다. 프로젝트 루트에 .env 파일을 만들고 환경 변수를 담아 두어 프로젝트 여기저기서 사용할 수 있도록 한다.

MongoDB가 로컬에서 실행되고 있다면 URL의 형식은 다음과 같다.

```env
DB_HOST=mogodb://localhost:27017/<데이터베이스-이름>
```

mLab의 URL은 다음과 같다. 

```
DB_HOST=mongodb://<db사용자>:<db비밀번호>@5555.mlab.com:5555/<데이터베이스-이름>
```

DB_HOST_URL을 불러오기 위해 dotenv 패키지를 사용한다.

```typescript
const { MongoClient } = require('mongodb')
require('dotenv').config()

...

// 비동기 함수를 생성한다
async function start() {
  const app = express()
  const MONGO_DB = process.env.DB_HOST
  
  const client = await MongoClient.connect(
  	MONGO_DB,
    { useNewUrlParser: true }
  )
  
  const db = client.db()
  
  const context = { db }
  
  const server = new ApolloServer({ typeDefs, resolvers, context })
  
  server.applyMiddleware({ app })
  
  app.get('/', (req, res) => res.end('Welcome to the PhotoShare API'))
  
  app.get('/playground', expressPlayground({ endPoint: '/graphql' }))
  
  app.listen({ port: 4000 }, () => console.log(`GraphQL Server running at http://localhost:4000${server.graphqlpath}`))
}

// 시작 준비를 마친 후에 함수를 호출한다
start()
```

비동기 start 함수를 호출하면 데이터베이스가 앱에 연결된다. 연결 성공까지 시간이 어느 정도 걸린다. 이 함수에서 제일 먼저 하는 일은 로컬 혹은 원격 데이터베이스 연결이 성공적으로 이루어질 때 까지 기다리는 것이다. 데이터베이스에 연결되었다면 컨텍스트 객체에 연결 정보가 추가되고 서버가 시작된다. 

이제 쿼리 리졸버에서 배열 대신 MongoDB 안의 정보를 반환하도록 만들 수 있다. `totalUsers` 와 `allUsers`에 관한 쿼리와 스키마도 추가해보자



```typescript
// 스키마
type Query {
	...
	totalUsers: Int!
	allUsers: [User!]!
}

// 리졸버
Query: {
  totalPhotos: (parent, args, { db }) => db.collection('photos').estimatedDocumentCount(),
               
  allPhotos: (parent, args, { db }) => db.collection('users').estimatedDocumentCount(),
    
  allUsers: (parent, args, { db }) => db.collection('users').find().toArray()
}
```

MongoDB 콜렉션 접근은 db.collection('photo')에서 이루어진다. `.estimatedDocumentCount` 를 사용해 콜렉션 안의 도큐먼트 수를 얻는다. `.find().toArray` 는 콜렉션 안의 모든 도큐먼트를 리스트로 받아서 배열로 변환한다.

### 5.5 깃허브 인증

#### 깃허브 OAuth 설정

1. https://www.github.com 에 가서 로그인한다.
2. 계정 관리(settings)로 간다.
3. 개발자 관리(Developer Settings)로 간다.
4. OAuth App 탭을 선택한 후 'New OAuth App' (혹은 'Register a new application') 버튼을 클릭한다
5. 다음과 같이 설정한다

   * 어플리케이션 이름(Localhost 3000)
* 홈페이지 URL(http://localhost:3000)
   * 애플리케이션 설명(로컬 깃허브 테스트를 위한 인증)
* 인증 콜백 URL(http://localhost:3000)
6. 등록 버튼을 클릭한다
7. OAuth 계정 페이지로 가서 client_id, client_secret 정보를 얻는다

#### githubAuth 뮤테이션

깃허브 뮤테이션으로 사용자 권한 인증 과정을 구현할 수 있다.

```typescript
type AuthPayload {
	token: String!
	user: User!
}

type Mutation {
	...
	githubAuth(code: String!): AuthPayload!
}
```

githubAuth 리졸버 코드를 작성하기 전에, 깃허브 API 요청을 다루는 두 개의 함수를 만들어보자

```typescript
const requestGithubToken = credentials => fetch('https://github.com/login/oauth/access_token', {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  body: JSON.stringfy(credentials)
}).then(res => res.json())
	.catch(error => {
    throw new Error(JSON.stringfy(error));
})
```

깃허브 토큰을 받아 왔다면, 현재 사용자의 계정 정보에 접근할 차례이다. 이전 요청에서 받은 접근 token을 사용해 깃허브 API 요청을 한번 더 보내야 한다

```typescript
const requestGithubUserAccount = token => fetch(`https://api.github.com/user?access_token=${token}`)
	.then(toJSON)
	.catch(throwError);
```

```typescript
async authorizeWithGithub(credentials) {
  const { access_token } = await requestGithubToken(credentials)
  const githubUser = await requestGithubUserAcount(access_token)
  return { ...githubUser, access_token }
}
```

이제 실제로 깃허브에서 토큰과 사용자 계정 정보를 받아오는 리졸버 함수를 작성해보자

```typescript
const githubAuth = async (parent, { code }, { db }) => {
  // 1. 깃허브에서 데이터를 받아온다
  let {
    message,
    access_token,
    avatar_url,
    login,
    name
  } = await authorizeWithGithub({
    clientid: <YOUR_CLIENT_ID_HERE>,
    client_secret: <YOUR_CLIENT_SECRET_HERE>,
    code
  });
  
  // 2. 메시지가 있다면 무언가 잘못된 것입니다.  
  if(message){
    throw new Error(message);
  }
  
	// 3. 결과 값을 하나의 객체 안에 담습니다.
  let latestUserInfo = {
    name,
    githubLogin: login,
    githubToken: access_token,
    avatar: avatar_url
  };
  
  // 4. 데이터를 새로 추가하거나 이미 있는 데이터를 업데이트합니다.
  const {
    ops: [user]
  } = await db.collection("users").replaceOne({ githubLogin: login }, latestUserInfo, {upsert: true});
  
  // 5. 사용자 데이터와 토큰을 반환합니다.
  return { user, token: access_token };
}
```

깃허브에서 데이터를 받아 온 후에는 로컬 데이터베이스를 확인하여 사용자가 이전에 앱에 로그인한 적이 있었는지 확인합니다. 로그인한 적이 있다면 계정을 가지고 있다는 의미이다. 계정을 아직 가지고 있지 않다면 신규 사용자로 콜렉션에 추가한다.

이제 권한 부여 과정을 테스트해보겠다. 다음 URL에 클라이언트 ID를 추가해 코드를 얻어온다.

https://github.com/login/oauth/authorize?client_id={YOUR-ID-HERE}&scope=user

url에 깃허브 client_id를 넣고 주소를 입력하면 앱 인증 동의 페이지가 뜨게 될텐데, 인증을 마치게 될 경우 http://localhost:3000으로 리다이렉팅된다

http://localhost:3000?code=XYZ

코드가 XYZ라고 가정해보겠다. 브라우저 URL에서 코드를 복사해 githubAuth 뮤테이션에 넣어 보낸다

```graphql
mutation {
	githubAuth(code: "XYZ") {
		token
		user {
			githubLogin
			name
			avatar
		}
	}
}
```

뮤테이션이 완료되면 현재 사용자에 대한 권한 인증 과정이 마무리되며 사용자 정보가 담긴 토큰이 반환된다.

#### 사용자 권한 인증

요청을 할 때마다 Authorization 헤더에 토큰을 넣어야 사용자 식별을 할 수 있다. GraphQL 플레이그라운드에는 요청 헤더를 추가할 수 있는 곳이 있다. 하단 구석에 `Query Variables` 탭 바로 오른쪽에 `HTTP Headers` 탭에 헤더에 들어갈 내용을 JSON으로 작성하면 된다

```json
{
  "Authorization": "<YOUR_TOKEN>"
}
```

**me 쿼리**

컨텍스트에 사용자 계정 정보를 한번만 넣어두면 이를 통해 모든 리졸버 함수에서 현재 사용자 정보에 접근할 수 있다.객체 대신에 함수가 컨텍스트를 다루도록 코드를 수정하겠다

```typescript
async function start() {
  const app = express()
  const MONGO_DB = process.env.DB_HOST
  
  const client = await MongoClient.connect(
  	MONGO_DB,
    { useNewUrlParser: true }
  )
  
  const db = client.db()
  
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      const githubToken = req.headers.authorization
      const currentUser = await db.collection('users').findOne({ githubToken })
      
      return { db, currentUser }
    }
  })
}
```

컨텍스트는 객체나 함수로 만든다. GraphQL 요청이 있을 때 마다 컨텍스트 함수가 호출된다. 함수에서 반환하는 객체 컨텍스트는 리졸버 함수로 전달된다.

코드 정리가 끝났다면 me 쿼리를 추가해보겠다. 

```typescript
type Query {
	me: User
	...
}

const resolvers = {
  Query: {
    me: (parent, args, { currentUser }) => currentUser,
    ...
  }
}
```

사용자 데이터가 없다면 null을 반환하고 아니라면 context는 currentUser 객체를 반환한다.

HTTP 권한 인증 헤더에 토큰이 제대로 추가되었다면 me 쿼리로 사용자 정보 요청을 보낼 수 있다. 잘못된 토큰을 넣거나 헤더 없이 쿼리를 실행하면 me 값은 null이 오게 된다.

```graphql
query currentUser {
	me {
		githubLogin
		name
		avatar
	}
}
```

책에서는 postPhoto 뮤테이션도 다루지만, me 쿼리와 크게 다르다고 생각하지 않아 정리하지 않도록 하겠다. (주로 github api 사용하는 법이 나온다)





