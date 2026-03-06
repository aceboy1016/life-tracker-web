import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import readline from 'readline';

const firebaseConfig = {
    apiKey: "AIzaSyC_D21gdJ5gtP0QmpInbwausb1JT3YRih8",
    authDomain: "lifetracker-dc521.firebaseapp.com",
    projectId: "lifetracker-dc521",
    storageBucket: "lifetracker-dc521.firebasestorage.app",
    messagingSenderId: "953510146022",
    appId: "1:953510146022:web:9be9f6edd216fa0e257027",
};

// Notionから取得したデータ
const notionEvents = [
    {
        name: 'iPhone 14 Pro購入',
        category: 'electronics',
        lastExecutedDate: new Date('2023-02-05'),
        notes: '',
    },
    {
        name: 'Apple Watch 5',
        category: 'electronics',
        lastExecutedDate: new Date('2022-06-17'),
        notes: '',
    },
    {
        name: 'FIT PLACE',
        category: 'hobby',
        lastExecutedDate: new Date('2025-08-28'),
        notes: '',
    },
    {
        name: 'MacBook Air購入',
        category: 'electronics',
        lastExecutedDate: new Date('2024-03-01'), // ※スクショで見えなかったので要確認
        notes: '',
    },
];

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (q) => new Promise(r => rl.question(q, r));

async function main() {
    console.log('🔐 LifeTracker ログイン');
    const email = await question('メールアドレス (例: junnya1995@gmail.com): ');
    const password = await question('パスワード: ');

    try {
        const cred = await signInWithEmailAndPassword(auth, email.trim(), password.trim());
        const uid = cred.user.uid;
        console.log(`✅ ログイン成功 (UID: ${uid})\n`);

        console.log('📥 イベントを追加中...');
        for (const event of notionEvents) {
            const docRef = await addDoc(collection(db, 'users', uid, 'events'), {
                name: event.name,
                category: event.category,
                lastExecutedDate: Timestamp.fromDate(event.lastExecutedDate),
                notes: event.notes,
                userId: uid,
                createdAt: Timestamp.now(),
            });
            console.log(`  ✅ ${event.name} → ${docRef.id}`);
        }

        console.log('\n🎉 全 ' + notionEvents.length + ' 件のイベントを追加しました！');
        console.log('https://life-tracker-web.vercel.app を確認してください。');
    } catch (err) {
        console.error('❌ エラー:', err.message);
    } finally {
        rl.close();
        process.exit(0);
    }
}

main();
