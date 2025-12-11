import { Topic } from './types';

export const TOPICS: Topic[] = [
  {
    id: 'haredim-draft',
    title: 'גיוס חרדים',
    description: 'האם יש לחייב את תלמידי הישיבות בגיוס לצה"ל או להמשיך את הפטור הקיים?',
    // Placeholder representing "Half Haredim studying / Half Soldiers in war"
    imageUrl: 'https://placehold.co/800x600/1e293b/ffffff?text=Torah+Study+%7C+Soldiers+at+War', 
    badge: 'הנושא היומי'
  },
  {
    id: 'coalition-opposition',
    title: 'אופוזיציה מול קואליציה',
    description: 'דיון פתוח על המצב הפוליטי: נתניהו, לפיד, והעתיד של מדינת ישראל.',
    // Placeholder representing "Bibi Netanyahu and Yair Lapid"
    imageUrl: 'https://placehold.co/800x600/0f172a/ffffff?text=Bibi+Netanyahu+%26+Yair+Lapid',
    badge: 'נושא קבוע'
  }
];

export const MOCK_OPPONENT = {
  name: 'יוסי מתל אביב',
  phoneNumber: '0501234567', // Mock number
  avatarUrl: 'https://i.pravatar.cc/300?img=11',
  bio: 'נהג מונית, חובב אקטואליה ורדיו.',
  rating: 4.8,
  stanceDescription: 'מאמין ששוויון בנטל הוא הכרחי לחוסן הלאומי.',
};