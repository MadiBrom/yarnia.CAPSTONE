const prisma = require("../prisma");
const { faker } = require("@faker-js/faker");

const getRandomNumber = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// Predefined genres
const genres = [
  "Fantasy",
  "Science Fiction",
  "Romance",
  "Thriller",
  "Horror",
  "Mystery",
  "Drama",
  "Comedy",
];

const seed = async () => {
  // Create 5 administrators
  for (let i = 0; i < 2; i++) {
    await prisma.user.create({
      data: {
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        bio: faker.lorem.sentence(),
        joinedOn: faker.date.past(),
      },
    });
  }

  // Array to store all users (including administrators and regular users)
  const users = [];

  // Create 20 regular users
  for (let i = 0; i < 2; i++) {
    const user = await prisma.user.create({
      data: {
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        bio: faker.lorem.sentence(),
        joinedOn: faker.date.past(),
      },
    });

    users.push(user);

    // Create random number of stories for each user
    for (let j = 0; j < getRandomNumber(1, 20); j++) {
      const randomGenre = genres[getRandomNumber(0, genres.length - 1)]; // Pick a random genre

      const story = await prisma.story.create({
        data: {
          title: faker.lorem.words(3),
          content: faker.lorem.paragraphs(getRandomNumber(1, 100)),
          summary: faker.lorem.sentence(10),
          genre: randomGenre, // Assign a random genre to each story
          authorId: user.id, // The story's author
          createdAt: faker.date.past(),
        },
      });

      // Create random number of comments on the story
      for (let k = 0; k < getRandomNumber(0, 2); k++) {
        const randomUser = users[getRandomNumber(0, users.length - 1)];

        await prisma.comment.create({
          data: {
            content: faker.lorem.sentence(),
            userId: randomUser.id, // Use random user for comment
            storyId: story.storyId,
            createdAt: faker.date.past(),
          },
        });
      }

      // Create random bookmarks for each story
      for (let k = 0; k < getRandomNumber(0, 2); k++) {
        const randomUser = users[getRandomNumber(0, users.length - 1)];

        // Check if bookmark already exists
        const existingBookmark = await prisma.bookmark.findUnique({
          where: {
            userId_storyId: {
              userId: randomUser.id,
              storyId: story.storyId,
            },
          },
        });

        if (!existingBookmark) {
          await prisma.bookmark.create({
            data: {
              userId: randomUser.id,
              storyId: story.storyId,
              createdAt: faker.date.past(),
            },
          });
        } else {
          console.log(
            `Bookmark already exists for user ${randomUser.id} and story ${story.storyId}`
          );
        }
      }
    }
  }
};

seed()
  .then(async () => {
    console.log("Seeding completed");
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
