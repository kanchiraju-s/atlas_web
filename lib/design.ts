export function getTopicEmoji(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('bangalore') || t.includes('bengaluru') || t.includes('mumbai') || t.includes('delhi') || t.includes('city') || t.includes('living in')) return '🏙';
  if (t.includes('macbook') || t.includes('mac ') || t.includes('laptop') || t.includes('coding') || t.includes('developer') || t.includes('setup')) return '💻';
  if (t.includes('iphone') || t.includes('android') || t.includes('phone')) return '📱';
  if (t.includes('movie') || t.includes('film') || t.includes('cinema')) return '🎬';
  if (t.includes('game') || t.includes('gaming')) return '🎮';
  if (t.includes('coffee') || t.includes('cafe') || t.includes('cafes')) return '☕';
  if (t.includes('run') || t.includes('fitness') || t.includes('gym') || t.includes('sport')) return '🏃';
  if (t.includes('invest') || t.includes('money') || t.includes('finance') || t.includes('salary')) return '💰';
  if (t.includes('travel') || t.includes('trip') || t.includes('japan') || t.includes('abroad')) return '✈️';
  if (t.includes('work') || t.includes('job') || t.includes('career') || t.includes('remote') || t.includes('amazon') || t.includes('startup')) return '💼';
  if (t.includes('book') || t.includes('read') || t.includes('learn')) return '📚';
  if (t.includes('food') || t.includes('restaurant') || t.includes('eat')) return '🍽';
  if (t.includes('music') || t.includes('guitar') || t.includes('song')) return '🎵';
  if (t.includes('road') || t.includes('traffic') || t.includes('commute') || t.includes('metro')) return '🛣';
  if (t.includes('productivity') || t.includes('tool') || t.includes('notion') || t.includes('linear')) return '⚡';
  if (t.includes('ai') || t.includes('chatgpt') || t.includes('gpt') || t.includes('claude')) return '🤖';
  if (t.includes('windows') || t.includes('switch')) return '🖥';
  if (t.includes('health') || t.includes('mental') || t.includes('meditation') || t.includes('stoic')) return '🧘';
  if (t.includes('van') || t.includes('minimalism')) return '🌿';
  return '🌍';
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
