const prisma = require('../utils/prisma')


//Obteniendo posts
const obtainAllPosts = async () => {
  const posts = await prisma.post.findMany({
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc', // Post ordenados desde el más reciente
    },
  });

  return posts;
};

//Obteniendo Post por ID
const obtainPostById = async (id) => {
  const post = await prisma.post.findUnique({
    where: {
      id: Number(id), 
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return post;
};
module.exports = {obtainAllPosts, obtainPostById};