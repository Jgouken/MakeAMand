const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const translate = require('node-google-translate-skidz');
const languageNames = new Intl.DisplayNames(['en'], { type: 'language' });

module.exports = {
    name: 'translateto',
    aliases: ['t', 'trt', 'tt'],
    description: `Translate text into different languages using Google Translate.`,
    minidesc: `Translate text to a language using Google Translate.`,
    permissions: ["MANAGE_GUILD"],

    async execute(message, member, args, cmds, config, bot) {
        if (args[0]) {
            let languages = 'af,sq,ar,hy,az,be,bn,bs,bg,ca,ha,zh,co,hr,cs,da,nl,eo,et,fr,es,fl,fi,mg,ig,ga,gl,ka,de,el,gu,ht,ha,he,hi,hm,hu,is,in,it,ja,jv,kn,kk,km,ko,lo,la,lv,lt,mk,ms,ml,mt,mi,mr,mn,ne,no,ny,pl,pt,br,pa,ro,ru,gd,sr,si,sk,so,st,su,sw,sv,tg,te,th,tr,uk,ur,uz,vi,yi,yo,zu'.split(",")
            if (args[0] == 'shuffle' || args[0] == 'shu' || args[0] == 'mix' || args[0] == 'run') {
                // This is when Google Translate translates a message a bunch of times then reverts back to the original language, hopefully messed up.
                args.shift()
                var i = 0
                var x = 0
                var max = Math.random() * (50 - 20) + 20
                var last = args.join(" ")
                var firstLang = "en"
                async function trloop(input) {
                    i++
                    if (input == undefined) input = last
                    last = input
                    translate({
                        text: input,
                        source: 'auto',
                        target: languages[Math.floor(Math.random() * languages.length)]
                    }, async function (result) {
                        if (x < 1) firstLang = result.src; x++
                        if (i < max) { last = result.translation; await trloop(result.translation) }
                        else {
                            await translate({
                                text: result.translation,
                                source: 'auto',
                                target: firstLang
                            }, async function (result) {
                                var footer = ''
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
            } else {
                var arg = args.shift().toLocaleLowerCase()
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

                    var footer = ''
                    if (result.sentences) if (result.sentences.length > 1) if (result.sentences.at(-1).translit) footer = `${result.sentences.at(-1).translit}`

                    if (result.sentences[0].trans === result.sentences[0].orig && result.src != arg) {
                        message.channel.send({
                            embeds: [{
                                title: `Hmm...`,
                                color: 0xff0000,
                                description: `"${arg}" is not a language.`,
                                footer: {
                                    text: `Find the correct abbreviation for the language you wish to translate to.`
                                }
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
            message.channel.send(`What shall I translate for you? The first word should be the language it's in.`).then((msg) => {
                const filter = m => m.author === message.author;
                const collector = message.channel.createMessageCollector({ filter, time: 60000, max: 1 });

                collector.on('collect', m => {
                    var arguments = m.content.split(" ");
                    var arg = arguments.shift().toLocaleLowerCase()
                    if (arg == 'jp') arg = 'ja'
                    translate({
                        text: arguments.join(" "),
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

                        var footer = ''
                        if (result.sentences) if (result.sentences.length > 1) if (result.sentences.at(-1).translit) footer = `${result.sentences.at(-1).translit}`

                        if (result.sentences[0].trans === result.sentences[0].orig && result.src != arg) {
                            message.channel.send({
                                embeds: [{
                                    title: `Hmm...`,
                                    color: 0xff0000,
                                    description: `"${arg}" is not a language.`,
                                    footer: {
                                        text: `Find the correct abbreviation for the language you wish to translate to.`
                                    }
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
                });

                collector.on('end', collected => {
                    msg.delete()
                });
            })
        }
    }
}