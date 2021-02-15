// apollo-server를 불러옵니다.
const expressPlayground = require('graphql-playground-middleware-express').default
const { ApolloServer } = require('apollo-server-express');
const express = require('express');

// 루트 쿼리에 들어가는 리졸버
const typeDefs = `
    enum PhotoCategory {
        SELFIE
        PORTRAIT
        ACTION
        LANDSCAPE
        GRAPHIC
    }

    input PostPhotoInput {
        name: String!
        category: PhotoCategory=PORTRAIT
        description: String
    }

    # 1 Photo 타입 정의를 추가한다. 
    type Photo {
        id: ID!
        url: String!
        name: String!
        description: String
        category: PhotoCategory!
        postedBy: User!
        taggedUsers: [User!]!
    }

    type User {
        githubLogin: ID!
        name: String
        avatar: String
        postedPhotos: [Photo!]!
        inPhoto: [Photo!]!
    }

    # 2. allPhotos 에서 Photo 타입을 반환한다. 
    type Query {
        totalPhotos: Int!
        allPhotos: [Photo!]!
    }

    # 3. 뮤테이션에서 새로 게시된 사진을 반환한다
    type Mutation {
        postPhoto(input: PostPhotoInput! ): Photo!
    }
    
` // 스키마를 문자열 형태로 정의

// 1. 고유 ID를 만들기 위해 값을 하나씩 증가시킬 변수

var _id = 0;
var photos = [];

const resolvers = {
    Query: {
        // 2. 사진 배열의 길이를 반환
        totalPhotos: () => photos.length,
        allPhotos: () => photos
    },

    // 3. mutation & postPhoto 리졸버 함수
    Mutation: {
        postPhoto(parent, args) {

            // 2. 새로운 사진을 만들고 id를 부여합니다.
            var newPhoto = {
                id: _id++,
                ...args.input
            }
            photos.push(newPhoto);

            // 3. 새로 만든 사진을 반환
            return newPhoto;
        }
    },

    Photo: {
        url: parent => `https://link.com/img/${parent.id}.jpg`,
        postedBy: parent => {
            return photos.filter(p => p.githubLogin === parent.githubUser)
        },
    },

    User: {
        postedPhotos: parent => {
            return photos.filter(p => p.githubUser === p.githubLogin)
        }
    }
}


var app = express()


const server = new ApolloServer({
    typeDefs,
    resolvers
});

server.applyMiddleware({app})

app.get('/', (req, res) => res.end('photoShare API에 오신 것을 환영합니다!'))
app.get('/playground', expressPlayground({endpoint: '/graphql'}))

app.listen({ port: 4000 }, () => 
    console.log(`server running! http://localhost:4000${server.graphqlPath} `)
)