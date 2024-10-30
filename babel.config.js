module.exports = {
  presets: [
    '@babel/preset-env',
    '@babel/preset-typescript', // обробляє TypeScript
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties', // підтримка класових властивостей
    '@babel/plugin-transform-runtime', // допомагає з асинхронними функціями і генераторами
  ],
};