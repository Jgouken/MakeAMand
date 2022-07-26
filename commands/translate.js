const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const translate = require('node-google-translate-skidz');
const languageNames = new Intl.DisplayNames(['en'], { type: 'language' });

async function translation(input, targetLang) {
    return translate({
        text: input,
        source: 'auto',
        target: targetLang
    }, async function (result) {
        return result;
    })
}

module.exports = {
    name: 'translate',
    aliases: ['t', 'trt', 'tt'],
    description: `Translate text into different languages using Google Translate.`,
    minidesc: `Translate text to a language using Google Translate.`,
    permissions: ["MANAGE_GUILD"],

    async execute(message, member, args, cmds, config, bot) {
        if (args[0]) {
            var arg = args.shift().toLocaleLowerCase()
            if (!args[0]) {
                return message.channel.send({
                    embeds: [{
                        title: `Incomplete!`,
                        color: 0xff0000,
                        description: `You need some text to translate!\nEx: **${config.prefix}t ${arg.slice(0, 2)} Hola!**`,
                        footer: {
                            text: `Status Code: 400`
                        }
                    }]
                })
            }
            if (arg == 'shuffle' || arg == 'shu' || arg == 'mix' || arg == 'run') shuffle(args)
            else {
                if (arg == 'jp') arg = 'ja'
                translate({
                    text: args.join(" "),
                    source: 'auto',
                    target: arg
                }, async function (result) {
                    if (!result.translation) {
                        return message.channel.send({
                            embeds: [{
                                title: `Not yet!`,
                                color: 0xff0000,
                                description: `Google Translate does not have ${languageNames.of(arg)} (${arg}) as a translatable language yet. For more information [Full List of Languages](https://translate.google.com/intl/en/about/languages/)!`,
                                footer: {
                                    text: `Status Code: 400`
                                }
                            }]
                        })
                    }

                    var footer = `(Conf. ${Math.round(result.confidence * 100)}%)`
                    if (result.sentences) if (result.sentences.length > 1) if (result.sentences.at(-1).translit) footer = `${result.sentences.at(-1).translit}\n(Conf. ${Math.round(result.confidence * 100)}%)`

                    if (result.sentences[0].trans === result.sentences[0].orig && result.src != arg) {
                        message.channel.send({
                            embeds: [{
                                title: `Hmm...`,
                                color: 0xff0000,
                                description: `It seems that "${arg}" is not an abbreviated language. Check out an [Abbreviations List](https://www.sitepoint.com/iso-2-letter-language-codes/) to find what language you're looking for.`,
                            }]
                        })
                    } else {
                        message.channel.send({
                            embeds: [{
                                title: `${languageNames.of(result.src)} ➡ ${languageNames.of(arg)}`,
                                description: result.translation,
                                footer: {
                                    text: footer
                                }
                            }]
                        })
                    }

                })
            }
        } else {
            message.channel.send(`What shall I translate for you? The first word should be the abbreviated language it's in, or "shuffle."`).then((msg) => {
                const filter = m => m.author === message.author;
                const collector = message.channel.createMessageCollector({ filter, time: 60000, max: 1 });

                collector.on('collect', async m => {
                    var arguments = m.content.split(" ");
                    var arg = arguments.shift().toLocaleLowerCase()
                    if (arg == 'shuffle' || arg == 'shu' || arg == 'mix' || arg == 'run') shuffle(arguments)
                    else {
                        if (arg == 'jp') arg = 'ja'
                        await translation(arguments.join(" "), arg).then(async (result) => {
                            if (!result.translation) {
                                return message.channel.send({
                                    embeds: [{
                                        title: `Not yet!`,
                                        color: 0xff0000,
                                        description: `Google Translate does not have ${languageNames.of(arg)} (${arg}) as a translatable language yet. For more information [Full List of Languages](https://translate.google.com/intl/en/about/languages/)!`,
                                        footer: {
                                            text: `Status Code: 400`
                                        }
                                    }]
                                })
                            }

                            var footer = `(Conf. ${Math.round(result.confidence * 100)}%)`
                            if (result.sentences) if (result.sentences.length > 1) if (result.sentences.at(-1).translit) footer = `${result.sentences.at(-1).translit}\n(Conf. ${Math.round(result.confidence * 100)}%)`

                            if (result.sentences[0].trans === result.sentences[0].orig && result.src != arg) {
                                message.channel.send({
                                    embeds: [{
                                        title: `Hmm...`,
                                        color: 0xff0000,
                                        description: `It seems that "${arg}" is not an abbreviated language. Check out an [Abbreviations List](https://www.sitepoint.com/iso-2-letter-language-codes/) to find what language you're looking for.`,
                                    }]
                                })
                            } else {
                                message.channel.send({
                                    embeds: [{
                                        title: `${languageNames.of(result.src)} ➡ ${languageNames.of(arg)}`,
                                        description: result.translation,
                                        footer: {
                                            text: footer
                                        }
                                    }]
                                })
                            }

                        })
                    }
                });

                collector.on('end', collected => {
                    msg.delete()
                });
            })
        }

        function shuffle(args) {
            // This is when Google Translate translates a message a bunch of times then reverts back to the original language, hopefully messed up.
            let languages = 'af,sq,ar,hy,az,be,bn,bs,bg,ca,ha,zh,co,hr,cs,da,nl,eo,et,fr,es,fl,fi,mg,ig,ga,gl,ka,de,el,gu,ht,ha,he,hi,hm,hu,is,in,it,ja,jv,kn,kk,km,ko,lo,la,lv,lt,mk,ms,ml,mt,mi,mr,mn,ne,no,ny,pl,pt,br,pa,ro,ru,gd,sr,si,sk,so,st,su,sw,sv,tg,te,th,tr,uk,ur,uz,vi,yi,yo,zu'.split(",")
            var i = 0
            var max = Math.random() * (50 - 20) + 20
            var last = args.join(" ")
            var firstLang = "en"

            args.shift()
            async function trloop(input) {
                i++
                if (!input) input = last
                last = input
                await translation(input, languages[Math.floor(Math.random() * languages.length)]).then(async (result) => {
                    if (i < 2) firstLang = result.src
                    if (i < max) { last = result.translation; await trloop(result.translation) }
                    else {
                        await translation(result.translation, firstLang).then(async (result) => {
                            var footer = ``
                            if (result.sentences) if (result.sentences.length > 1) if (result.sentences.at(-1).translit) footer = `${result.sentences.at(-1).translit}`

                            message.channel.send({
                                embeds: [{
                                    title: `🔀 Language Shuffle (${languageNames.of(firstLang)}) 🔀`,
                                    description: result.translation,
                                    footer: {
                                        text: `${footer}\nTranslated through ${i} Languages!`
                                    }
                                }]
                            })
                        })
                    }
                })
            }
            trloop(args.join(" "))
            message.channel.sendTyping();

        }
    }
}