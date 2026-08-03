const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");

dotenv.config();

const SOURCE = process.env.SOURCE_MONGO_URI || "mongodb://127.0.0.1:27017/craftora";
const TARGET = process.env.TARGET_MONGO_URI || process.env.MONGO_URI;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function copyCollection(srcDb, tgtDb, name) {
  const docs = await srcDb.collection(name).find({}).toArray();
  if (!docs.length) {
    console.log(`  ${name}: empty, skipped`);
    return;
  }
  await tgtDb.collection(name).deleteMany({});
  const batchSize = 500;
  for (let i = 0; i < docs.length; i += batchSize) {
    const batch = docs.slice(i, i + batchSize);
    await tgtDb.collection(name).insertMany(batch, { ordered: false });
    await sleep(50);
  }
  console.log(`  ${name}: ${docs.length} documents`);
}

async function main() {
  if (!TARGET) {
    console.error("TARGET_MONGO_URI (your Atlas connection string) is required.");
    console.error('Run: node scripts/migrate-data.js  (with TARGET_MONGO_URI set in .env)');
    process.exit(1);
  }
  if (SOURCE === TARGET) {
    console.error("SOURCE and TARGET are the same. Nothing to do.");
    process.exit(1);
  }

  console.log(`Source: ${SOURCE.split("@").pop()}`);
  console.log(`Target: ${TARGET.split("@").pop()}`);

  const src = await MongoClient.connect(SOURCE, { serverSelectionTimeoutMS: 10000 });
  const tgt = await MongoClient.connect(TARGET, { serverSelectionTimeoutMS: 30000 });
  const srcDb = src.db();
  const tgtDb = tgt.db();

  const collections = (await srcDb.listCollections().toArray())
    .map((c) => c.name)
    .filter((n) => !n.startsWith("system."));

  console.log(`Copying ${collections.length} collections...`);
  for (const name of collections) {
    await copyCollection(srcDb, tgtDb, name);
  }

  console.log("Migration complete. Closing connections...");
  await src.close();
  await tgt.close();
  console.log("Done. Verify your Atlas dashboard shows all collections.");
}

main().catch((e) => {
  console.error("Migration failed:", e.message);
  process.exit(1);
});
