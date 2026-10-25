/* Every episode of Wobbin's Line. Numbered in release order; the page lists seasons newest first.
   poster: the moment (seconds) used as the card's still frame and where hover previews start. */
window.WL_SEASONS = [
  { n: 5, title: 'Small courage', episodes: [
    { id: 'monday-mountain', title: 'Monday Mountain', theme: 'dread', accent: '#7b5cff', poster: 7.45, line: 'A storm mountain looms bigger the longer Wobbin stares. Up close, it’s five small steps.', quote: 'it’s never as big up close.' },
    { id: 'imposter', title: 'Imposter', theme: 'imposter syndrome', accent: '#ffa300', poster: 19.4, line: 'Wobbin wins a crown and keeps trying to give it back. It keeps coming home.', quote: 'you’re not an imposter. you belong here.' },
    { id: 'decision', title: 'Decision', theme: 'too many choices', accent: '#29adff', poster: 17.4, line: 'The paths split into 2, 4, 8, then 16 while the sun goes down.', quote: 'pick one. you can always turn.' },
    { id: 'busy', title: 'Busy', theme: 'rushing past', accent: '#ff77a8', poster: 14.6, line: 'Wobbin rushes past a friend waving a birthday cake, faster every trip.', quote: 'slow down for the ones who wait.' },
    { id: 'rain-check', title: 'Rain Check', theme: 'cancelling plans', accent: '#ffec27', poster: 16.4, line: 'A cozy night in gets lonely. Next morning, another invite.', quote: 'not every plan needs a rain check. sometimes, go anyway.' },
  ] },
  { n: 4, title: 'Getting unstuck', episodes: [
    { id: 'tomorrow', title: 'Tomorrow', theme: 'putting it off', accent: '#ffa300', poster: 20.6, line: 'Every morning, ready, set... sit back down. The flag runs further away.', quote: 'you don’t have to be ready. just start.' },
    { id: 'highlight-reel', title: 'Highlight Reel', theme: 'comparison', accent: '#ff77a8', poster: 18.8, line: 'Friends hold up perfect pictures. The biggest one slips.', quote: 'don’t compare your every day to their best day.' },
    { id: 'small-steps', title: 'Small Steps', theme: 'consistency', accent: '#29adff', poster: 36.4, line: 'One drop a day into a big empty jar. Nothing, nothing, nothing, then everything.', quote: 'small steps, every day. they add up.' },
    { id: 'snooze', title: 'Snooze', theme: 'five more minutes', accent: '#ff004d', poster: 19.2, line: 'One alarm bird, then two, then four, while the whole day goes by.', quote: 'the day doesn’t wait. get up for it.' },
    { id: 'reset', title: 'Reset', theme: 'bad days', accent: '#7b5cff', poster: 14.0, line: 'Splat, rain, a runaway umbrella, mud. Then the whole line resets.', quote: 'bad days end. tomorrow is a new line.' },
  ] },
  { n: 3, title: 'Everyday struggles', episodes: [
    { id: 'last-minute', title: 'Last Minute', theme: 'procrastination', accent: '#ff004d', poster: 31.0, line: 'A whole week to build it. Naps, butterflies, clouds. Then one frantic night.', quote: 'why is the last night always the most productive?' },
    { id: 'yes', title: 'Yes', theme: 'people-pleasing', accent: '#ff77a8', poster: 21.0, line: 'Box after box on Wobbin’s head, until the little flower is buried.', quote: 'you can say no. they’ll be okay.' },
    { id: 'perfect', title: 'Perfect', theme: 'perfectionism', accent: '#7b5cff', poster: 10.5, line: 'One wrong pixel and the whole painting gets wiped. Again.', quote: 'done is better than perfect.' },
    { id: 'battery', title: 'Battery', theme: 'the social battery', accent: '#00e436', poster: 15.6, line: 'The party is great, and every “hey!!” costs a bar.', quote: 'it’s okay to need quiet.' },
    { id: 'seen', title: 'Seen', theme: 'waiting for a reply', accent: '#3b7dd8', poster: 20.2, line: 'Sent. Seen. Typing... nothing. The worry grows.', quote: 'not every silence is about you.' },
  ] },
  { n: 2, title: 'Loops', episodes: [
    { id: 'one-more', title: 'One More', theme: 'scrolling', accent: '#3b7dd8', poster: 19.5, line: 'Every tap gives a smaller, greyer heart while a whole day goes by.', quote: 'life doesn’t send notifications.' },
    { id: 'the-hill', title: 'The Hill', theme: 'keep going', accent: '#ff004d', poster: 41.3, line: 'Push a ball up a hill that grows after every fall.', quote: 'every hill has another side.' },
    { id: 'bloom', title: 'Bloom', theme: 'kindness', accent: '#ff77a8', poster: 21.0, line: 'Lift one wilted flower and watch the colour spread.', quote: 'pass it on.' },
    { id: 'hurry', title: 'Hurry', theme: 'slowing down', accent: '#ffa300', poster: 12.3, line: 'A ticking clock, a sprint, a trip, and a snail.', quote: 'you’ll still get there.' },
    { id: 'what-if', title: 'What If', theme: 'overthinking', accent: '#7b5cff', poster: 19.0, line: 'A small worry grows into a tangle, until Wobbin breathes.', quote: 'let it go.' },
  ] },
  { n: 1, title: 'First lines', episodes: [
    { id: 'the-cloud', s1: true, title: 'The Cloud', theme: 'sadness', accent: '#3aa655', line: 'A rain cloud follows Wobbin everywhere, until something grows.', quote: 'sit with it. something grows.' },
    { id: 'the-seed', s1: true, title: 'The Seed', theme: 'patience', accent: '#f08a24', line: 'Wobbin keeps digging up a seed to check on it.', quote: 'some things only grow when you stop watching.' },
    { id: 'the-gap', s1: true, title: 'The Gap', theme: 'courage', accent: '#3b7dd8', line: 'Stuck at the edge, until the line behind starts to vanish.', quote: 'jump before the ground decides for you.' },
  ] },
];
// release-order episode numbers (Season 1 = EP 01–03 … Season 5 = EP 19–23)
(() => {
  let n = 0;
  [...window.WL_SEASONS].reverse().forEach(s => s.episodes.forEach(e => { e.ep = ++n; e.season = s.n; }));
  window.WL_EPISODES = window.WL_SEASONS.flatMap(s => s.episodes).sort((a, b) => a.ep - b.ep);
})();
