const fetch = require('node-fetch')
const sharp = require('sharp')
const fsPromises = require('fs').promises

const apiUrl = "https://api.itsukaralink.jp/app/livers.json"
const imageSuffixNeckup1 = "_Neckup1"
const imageSuffixNeckup2 = "_Neckup2"
const imageSuffixBustup = "_bustup"

!(async () => {
  const res = await fetch(apiUrl)
  const livers = (await res.json()).data.liver_relationships

  // livers = array of objects like this
  // {
  //   liver: {
  //     id: 86,
  //     name: '夜見れな',
  //     furigana: 'よるみれな',
  //     english_name: 'Rena Yorumi',
  //     description: 'バーチャル世界に舞い降りた、アイドルマジシャン。ミステリアスな雰囲気が、観衆を魅了してやまない。しかし、マジックの腕は…ファンとの交流の場として、配信を利用したいらしい。',
  //     avatar: 'https://s3-ap-northeast-1.amazonaws.com/liver-icons/400x400/Rena_Yorumi_200626.png',
  //     public: 1,
  //     color: '#f7265a',
  //     position: 370
  //   },
  //   liver_twitter_account: { id: 86, liver_id: 86, screen_name: 'rena_yorumi' },
  //   liver_youtube_channel: {
  //     id: 90,
  //     liver_id: 86,
  //     creation_order: 1,
  //     channel: 'UCL34fAoFim9oHLbVzMKFavQ',
  //     channel_name: '夜見れな/yorumi rena【にじさんじ所属】'
  //   },
  //   user_liver: null
  // },

  // generate json

  const result = livers.map(liver => {
    const enName = liver.liver.english_name
    
    return {
      name: enName,
      image: [
        enName + imageSuffixNeckup1,
        enName + imageSuffixNeckup2,
        enName + imageSuffixBustup
      ],
      liver_id: liver.liver.id,
      jpname: liver.liver.name,
      color: liver.liver.color.toUpperCase(),
      youtube: `https://www.youtube.com/channel/${liver.liver_youtube_channel.channel}`,
      twitter: `https://twitter.com/${liver.liver_twitter_account.screen_name}`,
      tags: [],
      related: [],
      bioText: "",
    }
  })

  const outFileHandle = await fsPromises.open('livers.json', 'w')
  const jsonString = JSON.stringify(result, null, 4)  // 4 space indentation
  await outFileHandle.writeFile(jsonString)
  await outFileHandle.close()

  // generate 300x300 png images
  for (const liver of livers) {
    await sleep(500)
    const avatarUrl = liver.liver.avatar
    const filename = `${liver.liver.english_name}${imageSuffixBustup}.png`
    const filepath = `./liver_images/${filename}`
    const imageBuffer = await (await fetch(avatarUrl)).buffer()
    await sharp(imageBuffer).resize(300, 300).toFile(filepath)
    console.log(`generated ${filename}`)
  }
})()

const sleep = ms => new Promise(resolve => {
  setTimeout(() => resolve(), ms)
})
