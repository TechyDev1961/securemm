const { Client } = require('discord.js');
const { default: axios } = require("axios");
const discordTranscripts = require('discord-html-transcripts');
const client = new Client();
const mmMongo = require("../database/mm");

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity("middlemen do their job.", {type: "WATCHING"});
    makeMm()
});

//mongoose connection
const makeMm = async ( ) => {
    const mmguild = client.guilds.cache.get("964235537248571503");
    const members = await mmguild.members.cache.filter(m => m.roles.cache.has("964236519307100182"))
    members.forEach(async (m) => {
        const foundMm = await mmMongo.findOne({ userId: m.user.id })
        if (!foundMm){
            await mmMongo.create({ userId: m.user.id, username: m.user.username, vouches: [], rating: 0, avatar: m.user.avatarURL({ dynamic: true }) });
            console.log("Created mm " + m.user.id)
        } else{
            console.log("MM already found " + m.user.id)
        }
    })
}
const findIndex = async ( arr, vouchId ) => {
    return new Promise((resolve) => {
        for (let i = 0; i<arr.length; i++) {
            let v = arr[i];
            if (v.vouchId == vouchId) {
                resolve(i)
            }
        }
        resolve(false)
    })
}
const sendMsg = async ( mmId, userId, username, feedback, vouchId ) => {
    let server = await client.guilds.cache.get('964235537248571503')
    let member = await server.members.cache.find(m => m.user.id === mmId )
    if (!member.roles.cache.has("964236519307100182")) return false
    await member.send({
        embed: {
            color: "GREEN",
            title: "New Vouch",
            description: `${username}( ${userId} ) Vouched for you on our site`,
            fields: [
                {
                    name: "Comment",
                    value: feedback,
                    inline: true
                },
                {
                    name: "VouchId",
                    value: vouchId,
                    inline: true
                }
            ],
            thumbnail: {
                "url": `https://cdn.upload.systems/uploads/PRBEp3Mk.png`,
            },
            footer: {
                text: "SecureMM Inc.",
                icon_url: "https://cdn.discordapp.com/attachments/965514383344169000/965514406781943829/securemm.png"
            }
        }
    })
    return true
}

const addMemberToGuild = async (accessToken, userId) => {
    await axios.put(`https://discord.com/api/v9/guilds/964235537248571503/members/${userId}`, { 
        access_token: accessToken
    } , { 
        headers: {
            "Authorization": `Bot ${client.token}`
        }
    })
}
const getMmList = async () => {
    let server = await client.guilds.cache.get('964235537248571503')
    let members = await server.members.cache.array().filter(member => member.roles.cache.has("964236519307100182"))
    return members;
}
const createTicket = async (userId, mmId, product, currency) => {
    let guild = await client.guilds.cache.get("964235537248571503")
    let newChannel = await guild.channels.create(`mm-${userId}`, {
        permissionOverwrites: [{
                id: userId,
                allow: ["SEND_MESSAGES", "VIEW_CHANNEL"]
            },
            {
                id: mmId,
                allow: ["SEND_MESSAGES", "VIEW_CHANNEL"]
            },
            {
                id: guild.roles.everyone,
                deny: ["VIEW_CHANNEL"]
            }
        ],
    })
    newChannel.send( `<@${userId}>` ,{
        embed: {
            title: "New Middleman Request",
            description: `<@${mmId}>, <@${userId}> requested a middleman.`,
            color: "ORANGE",
            thumbnail: {
                "url": `https://cdn.upload.systems/uploads/PRBEp3Mk.png`,
            },
            footer: {
                text: "SecureMM Inc.",
                icon_url: "https://cdn.discordapp.com/attachments/965514383344169000/965514406781943829/securemm.png"
            },
            timestamp: new Date(),
            fields: [{
                    name: "Product",
                    value: product,
                    inline: true
                },
                {
                    name: "Payment Method",
                    value: currency,
                    inline: true
                }
            ]
        }
    })
    //pin the message
    /*await newChannel.messages.fetch(newChannel.lastMessageID).then(async msg => {
        await msg.pin()
    })*/
    return newChannel
}
const sendMessage = async (userId, product, currency, username, memberId) => {
    let server = await client.guilds.cache.get('964235537248571503')
    let member = await server.members.cache.find(user => user.id == userId)
    let msg = await member.send(`${username} ( ${memberId} ) requested a MiddleMan`, {
        embed: {
            title: "New Middleman Request",
            description: `Hello! Your middleman services have been requested on our site.\n The message will be deleted in 10 minutes if no response is sent.\n Please use the below reactions to confirm or deny the following request:`,
            fields: [{
                name: "Product",
                value: product,
                inline: true
            },
            {
                name: "Currency",
                value: currency,
                inline: true
            }
            ],
            color: "ORANGE",
            thumbnail: {
                "url": `https://cdn.upload.systems/uploads/PRBEp3Mk.png`,
            },
            footer: {
                text: "SecureMM Inc.",
                icon_url: "https://cdn.discordapp.com/attachments/965514383344169000/965514406781943829/securemm.png"
            },
            timestamp: new Date()
        }
    })
    await msg.react("✅")
    await msg.react("❌")
    const filter = (reaction, user) => user.id !== client.user.id;
    let collector = await msg.createReactionCollector(filter, {
        time: 600000
    })
    let newMember = await server.members.cache.find(user => user.id === memberId)
    collector.on("collect", async (reaction, user) => {
        switch (reaction.emoji.name) {
            case "✅":
                const ticket = await createTicket(memberId, userId, product, currency)
                collector.stop();
                let newMember = await server.members.cache.find( user => user.id === memberId )
                await newMember.send({
                    embed: {
                        title: "Middleman Request Accepted",
                        description: `Your request has been accepted.\nChannel: <#${ticket.id}>`,
                        color: "GREEN",
                        thumbnail: {
                            "url": `https://cdn.upload.systems/uploads/PRBEp3Mk.png`
                        },
                        footer: {
                            text: `SecureMM Inc.`,
                            icon_url: `https://cdn.discordapp.com/attachments/965514383344169000/965514406781943829/securemm.png`
                        },
                        timestamp: new Date()
                    }
                })
                await member.send(`I've created a ticket with ${username} in <#${ticket.id}>.`)
                break;
            case "❌":
                let newMember2 = await server.members.cache.find( user => user.id === memberId )
                await newMember2.send({
                    embed: {
                        title: "Middleman Request Denied",
                        description: `Your request has been denied.`,
                        color: "RED",
                        thumbnail: {
                            "url": `https://cdn.upload.systems/uploads/PRBEp3Mk.png`
                        },
                        footer: {
                            text: `SecureMM Inc.`,
                            icon_url: `https://cdn.discordapp.com/attachments/965514383344169000/965514406781943829/securemm.png`
                        },
                        timestamp: new Date()
                    }
                })
                collector.stop();
                await member.send("Action cancelled.")
        }
    })
    collector.on("end", async () => {
        msg.delete()
    })
}
client.on("message", async (message) => {
    const prefix = "mm!"
    if (!message.content.startsWith(message) || message.author.bot || !message.guild) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();



    if (command === "close") {
        if (!message.channel.name.startsWith("mm-")) return;
        let firstMsg = await message.channel.send({ embed: { color: "ORANGE", description: "Saving transcript..."}})
        let secondMsg = await message.channel.send({ embed: { color: "ORANGE", description: "Deleting ticket..."}})
        const channel = message.channel;
        const ticketTranscript = await discordTranscripts.createTranscript(channel);
        const ticketOwnerId = channel.name.split("-")[1]
        const ticketOwnerUser = client.users.cache.find(user => user.id === ticketOwnerId)
        let msg2 = await ticketOwnerUser.send({
            embed: {
                title: `Action successful!`,
                description: `Successfully closed & transcribed your ticket.`,
                color: "GREEN",
                thumbnail: {
                    url: `https://cdn.upload.systems/uploads/JXqttQfy.png`
                  },
                footer: {
                    text: `SecureMM Inc.`,
                    icon_url: `https://cdn.discordapp.com/attachments/965514383344169000/965514406781943829/securemm.png`
                },
                timestamp: new Date()
            },
            files: [ticketTranscript]
        })
        let viewOnline1 = await msg2.attachments.array()[0].url.split("https://cdn.discordapp.com/attachments/")[1].split("/transcript.html")[0]
        let url1 = `http://localhost:3001/api/ticket/direct/${viewOnline1}`
        msg2.edit({
            embed: {
                title: `Action successful!`,
                description: `Successfully closed & transcribed your ticket.\n[View ticket online](${url1})`,
                color: "GREEN",
                thumbnail: {
                    url: `https://cdn.upload.systems/uploads/JXqttQfy.png`
                  },
                footer: {
                    text: `SecureMM Inc.`,
                    icon_url: `https://cdn.discordapp.com/attachments/965514383344169000/965514406781943829/securemm.png`
                },
                timestamp: new Date()
            },
            files: [ticketTranscript]
        })
        firstMsg.edit({ embed: { color: "GREEN", description: "Transcript saved and sent to ticket owner"}})
        
        //reactions to rate the middleman
        let msg = await ticketOwnerUser.send({
            embed: {
                title: "Rate the middleman",
                description: `Please use the reactions below to rate the middleman. \n You have 10minutes to do so.`,
                color: "ORANGE",
                thumbnail: {
                    "url": `https://cdn.upload.systems/uploads/Y3S6OBES.png`,
                },
                footer: {
                    text: "SecureMM Inc.",
                    icon_url: "https://cdn.discordapp.com/attachments/965514383344169000/965514406781943829/securemm.png"
                },
                timestamp: new Date(),
            }
        })

        await msg.react("👍");
        await msg.react("👎");
        const filter = (reaction, ticketOwnerUser) => ticketOwnerUser.id !== client.user.id;
        let collector = await msg.createReactionCollector(filter, {
            time: 600000
        })

        collector.on("collect", async (reaction, ticketOwnerUser) => {
            switch (reaction.emoji.name) {
                case "👍":
                    collector.stop();
                    await ticketOwnerUser.send({
                        embed: {
                            title: "Rating successful!",
                            description: `You have successfully rated the middleman 👍.`,
                            color: "GREEN",
                            thumbnail: {
                                "url": `https://cdn.upload.systems/uploads/JXqttQfy.png`
                            },
                            footer: {
                                text: `SecureMM Inc.`,
                                icon_url: `https://cdn.discordapp.com/attachments/965514383344169000/965514406781943829/securemm.png`
                            },
                            timestamp: new Date()
                        }
                    })
                    break;
                case "👎":
                    await ticketOwnerUser.send({
                        embed: {
                            title: "Rating successful!",
                            description: `You have successfully rated the middleman 👎.`,
                            color: "GREEN",
                            thumbnail: {
                                "url": `https://cdn.upload.systems/uploads/JXqttQfy.png`
                            },
                            footer: {
                                text: `SecureMM Inc.`,
                                icon_url: `https://cdn.discordapp.com/attachments/965514383344169000/965514406781943829/securemm.png`
                            },
                            timestamp: new Date()
                        }
                    })
                    collector.stop();
            }
        })
        collector.on("end", async () => {
            msg.delete()
        })


        //send the transcript to the ticket transcript channel
        const ticketTranscriptChannel = await client.channels.cache.get("968197949203042404")
        let msg1 = await ticketTranscriptChannel.send({
            embed: {
                title: `Action successful!`,
                description: `Successfully closed & transcribed the ticket. \n This transcript is for the user: **${ticketOwnerUser.username}${ticketOwnerUser.discriminator} ( ${ticketOwnerUser} )**`,
                color: "GREEN",
                thumbnail: {
                    url: `https://cdn.upload.systems/uploads/JXqttQfy.png`
                },
                footer: {
                    text: `SecureMM Inc.`,
                    icon_url: `https://cdn.discordapp.com/attachments/965514383344169000/965514406781943829/securemm.png`
                },
                timestamp: new Date()
            },
            files: [ticketTranscript]
        }) 
        let viewOnline = await msg1.attachments.array()[0].url.split("https://cdn.discordapp.com/attachments/")[1].split("/transcript.html")[0]
        let url = `http://localhost:3001/api/ticket/direct/${viewOnline}`
        await msg1.edit({
            embed: {
                title: `Action successful!`,
                description: `Successfully closed & transcribed the ticket. \n This transcript is for the user: **${ticketOwnerUser.username}${ticketOwnerUser.discriminator} ( ${ticketOwnerUser} )**\n[View ticket online](${url})`,
                color: "GREEN",
                thumbnail: {
                    url: `https://cdn.upload.systems/uploads/JXqttQfy.png`
                    },
                footer: {
                    text: `SecureMM Inc.`,
                    icon_url: `https://cdn.discordapp.com/attachments/965514383344169000/965514406781943829/securemm.png`
                },
                timestamp: new Date()
            },
            files: [ticketTranscript]
        })
        await firstMsg.edit({ embed: { color: "GREEN", description: "Transcript saved and sent to ticket owner & logs channel."}})
        if (message.channel.name.startsWith("mm-")) return message.channel.delete()
        //case: middleman closes ticket
        if (message.member.roles.cache.has("964236519307100182")) {
            //if the middleman is the ticket owner, delete the ticket
            if (message.member.id === ticketOwnerId) {
                return;
            }
            const middlemanTicket = await client.guilds.cache.get("964235537248571503").members.cache.find(user => user.id === ticketOwnerId)
            await middlemanTicket.send({
                embed: {
                    title: `Action successful!`,
                    description: `Successfully closed & transcribed the ticket. \n This transcript is for the user: **${ticketOwnerUser.username}${ticketOwnerUser.discriminator} ( ${ticketOwnerUser} )**`,
                    color: "GREEN",
                    thumbnail: {
                        url: `https://cdn.upload.systems/uploads/JXqttQfy.png`
                        },
                    footer: {
                        text: `SecureMM Inc.`,
                        icon_url: `https://cdn.discordapp.com/attachments/965514383344169000/965514406781943829/securemm.png`
                    },
                    timestamp: new Date()
                },
                files: [ticketTranscript]
            })
        }
    }



    if(command === "transcript") {
        const channel = message.channel;
        const ticketTranscript = await discordTranscripts.createTranscript(channel);
        let msg = await message.author.send({
            embed: {
                title: `Action successful!`,
                description: `Successfully transcribed your ticket.`,
                color: "GREEN",
                thumbnail: {
                    url: `https://cdn.upload.systems/uploads/JXqttQfy.png`
                },
                footer: {
                    text: `SecureMM Inc.`,
                    icon_url: `https://cdn.discordapp.com/attachments/965514383344169000/965514406781943829/securemm.png`
                },
                timestamp: new Date()
            },
            files: [ticketTranscript]
        })
        let viewOnline = await msg.attachments.array()[0].url.split("https://cdn.discordapp.com/attachments/")[1].split("/transcript.html")[0]
        let url = `http://localhost:3001/api/ticket/direct/${viewOnline}`
        msg.edit({
            embed: {
                title: `Action successful!`,
                description: `Successfully transcribed your ticket.\n[View ticket online](${url})`,
                color: "GREEN",
                thumbnail: {
                    url: `https://cdn.upload.systems/uploads/JXqttQfy.png`
                },
                footer: {
                    text: `SecureMM Inc.`,
                    icon_url: `https://cdn.discordapp.com/attachments/965514383344169000/965514406781943829/securemm.png`
                },
                timestamp: new Date()
            },
            files: [ticketTranscript]
        })
    }

    if (command === "kick") {
        if (!message.member.permissions.has("KICK_MEMBERS")) {
            return message.channel.send({
                embed: {
                    title: "Action failed!",
                    description: `You do not have the permissions to kick members.`,
                    color: "RED",
                    thumbnail: {
                        "url": `https://cdn.upload.systems/uploads/THIJhI8b.png`
                    },
                    footer: {
                        text: `SecureMM Inc.`,
                        icon_url: `https://cdn.discordapp.com/attachments/965514383344169000/965514406781943829/securemm.png`
                    },
                    timestamp: new Date()
                }
            })
        }

        const user = message.mentions.users.first();
        if (!user) {
            return message.channel.send({
                    embed: {
                        color: "RED",
                        title: "Error: Invalid Usage",
                        description: "Invalid Usage: `mm!kick <@user/userId> <reason>`",
                        thumbnail: {
                            "url": "https://cdn.upload.systems/uploads/THIJhI8b.png",
                        },
                        footer: {
                            text: `SecureMM Inc.`,
                            icon_url: `https://cdn.discordapp.com/attachments/965514383344169000/965514406781943829/securemm.png`
                        },
                        timestamp: new Date()
                    }
            })
        }

        const reason = args.slice(1).join(" ");
        if (!reason) {
            return message.channel.send({
                    embed: {
                        color: "RED",
                        title: "Error: Invalid Usage",
                        description: "Invalid Usage: `mm!kick <@user/userId> <reason>`",
                        thumbnail: {
                            "url": "https://cdn.upload.systems/uploads/THIJhI8b.png",
                        },
                        footer: {
                            text: `SecureMM Inc.`,
                            icon_url: `https://cdn.discordapp.com/attachments/965514383344169000/965514406781943829/securemm.png`
                        },
                        timestamp: new Date()
                    }
            })
        }

        const member = message.guild.member(user);

        member.kick(reason);
        message.channel.send({
            embed: {
                title: "Action successful!",
                description: `Successfully kicked ${user.tag} for ${reason}`,
                color: "GREEN",
                thumbnail: {
                    "url": "https://cdn.upload.systems/uploads/JXqttQfy.png"
                },
                footer: {
                    text: `SecureMM Inc.`,
                    icon_url: `https://cdn.discordapp.com/attachments/965514383344169000/965514406781943829/securemm.png`
                },
                timestamp: new Date()
            }
        })
    }

    if (command === "ban") {
        if (!message.member.permissions.has("BAN_MEMBERS")) {
            return message.channel.send({
                embed: {
                    title: "Action failed!",
                    description: `You do not have the permissions to ban members.`,
                    color: "RED",
                    thumbnail: {
                        "url": `https://cdn.upload.systems/uploads/THIJhI8b.png`
                    },
                    footer: {
                        text: `SecureMM Inc.`,
                        icon_url: `https://cdn.discordapp.com/attachments/965514383344169000/965514406781943829/securemm.png`
                    },
                    timestamp: new Date()
                }
            })
        }
        const user = message.mentions.users.first();
        if (!user) {
            return message.channel.send({
                    embed: {
                        color: "RED",
                        title: "Error: Invalid Usage",
                        description: "Invalid Usage: `mm!ban <@user/userId> <reason>`",
                        thumbnail: {
                            "url": "https://cdn.upload.systems/uploads/THIJhI8b.png",
                        },
                        footer: {
                            text: `SecureMM Inc.`,
                            icon_url: `https://cdn.discordapp.com/attachments/965514383344169000/965514406781943829/securemm.png`
                        },
                        timestamp: new Date()
                    }
            })
        }

        const reason = args.slice(1).join(" ");
        if (!reason) {
            return message.channel.send({
                    embed: {
                        color: "RED",
                        title: "Error: Invalid Usage",
                        description: "Invalid Usage: `mm!ban <@user/userId> <reason>`",
                        thumbnail: {
                            "url": "https://cdn.upload.systems/uploads/THIJhI8b.png",
                        },
                        footer: {
                            text: `SecureMM Inc.`,
                            icon_url: `https://cdn.discordapp.com/attachments/965514383344169000/965514406781943829/securemm.png`
                        },
                        timestamp: new Date()
                    }
            })
        }

        const member = message.guild.member(user);
        member.ban(reason);
        message.channel.send({
            embed: {
                title: "Action successful!",
                description: `Successfully banned ${user.tag} for ${reason}.`,
                color: "GREEN",
                thumbnail: {
                    "url": "https://cdn.upload.systems/uploads/JXqttQfy.png"
                },
                footer: {
                    text: `SecureMM Inc.`,
                    icon_url: `https://cdn.discordapp.com/attachments/965514383344169000/965514406781943829/securemm.png`
                },
                timestamp: new Date()
            }
        })
    }

    if (command === "unban") {
        if (!message.member.permissions.has("BAN_MEMBERS")) {
            return message.channel.send({
                embed: {
                    title: "Action failed!",
                    description: `You do not have the permissions to unban members.`,
                    color: "RED",
                    thumbnail: {
                        "url": `https://cdn.upload.systems/uploads/THIJhI8b.png`
                    },
                    footer: {
                        text: `SecureMM Inc.`,
                        icon_url: `https://cdn.discordapp.com/attachments/965514383344169000/965514406781943829/securemm.png`
                    },
                    timestamp: new Date()
                }
            })
        }

        const user = message.mentions.users.first();
        if (!user) {
            return message.channel.send({
                    embed: {
                        color: "RED",
                        title: "Error: Invalid Usage",
                        description: "Invalid Usage: `mm!unban <@user/userId>`",
                        thumbnail: {
                            "url": "https://cdn.upload.systems/uploads/THIJhI8b.png",
                        },
                        footer: {
                            text: `SecureMM Inc.`,
                            icon_url: `https://cdn.discordapp.com/attachments/965514383344169000/965514406781943829/securemm.png`
                        },
                        timestamp: new Date()
                    }
            })
        }

        const member = message.guild.member(user);
        member.unban();
        message.channel.send({
            embed: {
                title: "Action successful!",
                description: `Successfully unbanned ${user.tag}`,
                color: "GREEN",
                thumbnail: {
                    "url": "https://cdn.upload.systems/uploads/JXqttQfy.png"
                },
                footer: {
                    text: `SecureMM Inc.`,
                    icon_url: `https://cdn.discordapp.com/attachments/965514383344169000/965514406781943829/securemm.png`
                },
                timestamp: new Date()
            }
        })

    }

    if (command === "mute") {
        if(!message.member.permissions.has("MUTE_MEMBERS")) {
            return message.channel.send({
                embed: {
                    title: "Action failed!",
                    description: `You do not have the permissions to mute members.`,
                    color: "RED",
                    thumbnail: {
                        "url": `https://cdn.upload.systems/uploads/THIJhI8b.png`
                    },
                    footer: {
                        text: `SecureMM Inc.`,
                        icon_url: `https://cdn.discordapp.com/attachments/965514383344169000/965514406781943829/securemm.png`
                    },
                    timestamp: new Date()
                }
            })
        }

        const user = message.mentions.users.first();
        if (!user) {
            return message.channel.send({
                    embed: {
                        color: "RED",
                        title: "Error: Invalid Usage",
                        description: "Invalid Usage: `mm!mute <@user/userId> <reason>`",
                        thumbnail: {
                            "url": "https://cdn.upload.systems/uploads/THIJhI8b.png",
                        },
                        footer: {
                            text: `SecureMM Inc.`,
                            icon_url: `https://cdn.discordapp.com/attachments/965514383344169000/965514406781943829/securemm.png`
                        },
                        timestamp: new Date()
                    }
            })
        }

        const reason = args.slice(1).join(" ");
        if (!reason) {
            return message.channel.send({
                    embed: {
                        color: "RED",
                        title: "Error: Invalid Usage",
                        description: "Invalid Usage: `mm!mute <@user/userId> <reason>`",
                        thumbnail: {
                            "url": "https://cdn.upload.systems/uploads/THIJhI8b.png",
                        },
                        footer: {
                            text: `SecureMM Inc.`,
                            icon_url: `https://cdn.discordapp.com/attachments/965514383344169000/965514406781943829/securemm.png`
                        },
                        timestamp: new Date()
                    }
            })
        }

        const member = message.guild.member(user);
        const mutedRole = message.guild.roles.cache.find( (role) => role.name === 'Muted');
        if(!mutedRole)
        {
            return message.channel.send({
                embed: {
                    title: "Action failed!",
                    description: `Muted role not found.`,
                    color: "RED",
                    thumbnail: {
                        "url": `https://cdn.upload.systems/uploads/THIJhI8b.png`
                    },
                    footer: {
                        text: `SecureMM Inc.`,
                        icon_url: `https://cdn.discordapp.com/attachments/965514383344169000/965514406781943829/securemm.png`
                    },
                    timestamp: new Date()
                }
            })
        }

        member.roles.add(mutedRole);
        message.channel.send({
            embed: {
                title: "Action successful!",
                description: `Successfully muted ${user.tag} for ${reason}.`,
                color: "GREEN",
                thumbnail: {
                    "url": "https://cdn.upload.systems/uploads/JXqttQfy.png"
                },
                footer: {
                    text: `SecureMM Inc.`,
                    icon_url: `https://cdn.discordapp.com/attachments/965514383344169000/965514406781943829/securemm.png`
                },
                timestamp: new Date()
            }
        })
    }

    if (command === "unmute") {
        if(!message.member.permissions.has("MUTE_MEMBERS")) {
            return message.channel.send({
                embed: {
                    title: "Action failed!",
                    description: `You do not have the permissions to unmute members.`,
                    color: "RED",
                    thumbnail: {
                        "url": `https://cdn.upload.systems/uploads/THIJhI8b.png`
                    },
                    footer: {
                        text: `SecureMM Inc.`,
                        icon_url: `https://cdn.discordapp.com/attachments/965514383344169000/965514406781943829/securemm.png`
                    },
                    timestamp: new Date()
                }
            })
        }

        const user = message.mentions.users.first();
        if (!user) {
            return message.channel.send({
                    embed: {
                        color: "RED",
                        title: "Error: Invalid Usage",
                        description: "Invalid Usage: `mm!unmute <@user/userId>`",
                        thumbnail: {
                            "url": "https://cdn.upload.systems/uploads/THIJhI8b.png",
                        },
                        footer: {
                            text: `SecureMM Inc.`,
                            icon_url: `https://cdn.discordapp.com/attachments/965514383344169000/965514406781943829/securemm.png`
                        },
                        timestamp: new Date()
                    }
            })
        }

        const member = message.guild.member(user);
        const mutedRole = message.guild.roles.cache.find( (role) => role.name === 'Muted');
        if(!mutedRole)
        {
            return message.channel.send({
                embed: {
                    title: "Action failed!",
                    description: `Muted role not found.`,
                    color: "RED",
                    thumbnail: {
                        "url": `https://cdn.upload.systems/uploads/THIJhI8b.png`
                    },
                    footer: {
                        text: `SecureMM Inc.`,
                        icon_url: `https://cdn.discordapp.com/attachments/965514383344169000/965514406781943829/securemm.png`
                    },
                    timestamp: new Date()
                }
            })
        }

        member.roles.remove(mutedRole);
    }

    if (command === "warn") {
        if(!message.member.permissions.has("KICK_MEMBERS")) {
            return message.channel.send({
                embed: {
                    title: "Action failed!",
                    description: `You do not have the permissions to warn members.`,
                    color: "RED",
                    thumbnail: {
                        "url": `https://cdn.upload.systems/uploads/THIJhI8b.png`
                    },
                    footer: {
                        text: `SecureMM Inc.`,
                        icon_url: `https://cdn.discordapp.com/attachments/965514383344169000/965514406781943829/securemm.png`
                    },
                    timestamp: new Date()
                }
            })
        }

        const user = message.mentions.users.first();
        if (!user) {
            return message.channel.send({
                    embed: {
                        color: "RED",
                        title: "Error: Invalid Usage",
                        description: "Invalid Usage: `mm!warn <@user/userId> <reason>`",
                        thumbnail: {
                            "url": "https://cdn.upload.systems/uploads/THIJhI8b.png",
                        },
                        footer: {
                            text: `SecureMM Inc.`,
                            icon_url: `https://cdn.discordapp.com/attachments/965514383344169000/965514406781943829/securemm.png`
                        },
                        timestamp: new Date()
                    }
            })
        }
        
        const reason = args.slice(1).join(" ");
        if (!reason) {
            return message.channel.send({
                    embed: {
                        color: "RED",
                        title: "Error: Invalid Usage",
                        description: "Invalid Usage: `mm!warn <@user/userId> <reason>`",
                        thumbnail: {
                            "url": "https://cdn.upload.systems/uploads/THIJhI8b.png",
                        },
                        footer: {
                            text: `SecureMM Inc.`,
                            icon_url: `https://cdn.discordapp.com/attachments/965514383344169000/965514406781943829/securemm.png`
                        },
                        timestamp: new Date()
                    }
            })
        }

        const member = message.guild.member(user);
        member.send({
            embed: {
                title: "You have been warned!",
                description: `You have been warned in ${message.guild.name} by ${message.author} for ${reason}.`,
                color: "RED",
                thumbnail: {
                    "url": `https://cdn.upload.systems/uploads/JXqttQfy.png`
                },
                footer: {
                    text: `SecureMM Inc.`,
                    icon_url: `https://cdn.discordapp.com/attachments/965514383344169000/965514406781943829/securemm.png`
                },
                timestamp: new Date()
            }
        })

        message.channel.send({
            embed: {
                title: "Action successful!",
                description: `Successfully warned ${user.tag} for ${reason}.`,
                color: "GREEN",
                thumbnail: {
                    "url": `https://cdn.upload.systems/uploads/JXqttQfy.png`
                },
                footer: {
                    text: `SecureMM Inc.`,
                    icon_url: `https://cdn.discordapp.com/attachments/965514383344169000/965514406781943829/securemm.png`
                },
                timestamp: new Date()
            }
        })
    }


    if (command === "ping")
        return message.reply(`🏓 Latency is ${Date.now() - message.createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms`)


    
    if (command === "devdel") {
        //check if user id is 325345907719536641 or 946557491452457001
        if (message.author.id !== "325345907719536641" && message.author.id !== "946557491452457001") return message.reply("You are not authorized to use this command.")
        message.channel.delete();
    }

    
    if (command === "purge") {
        if (!message.member.roles.cache.has("964236519307100182"))
            return message.channel.send({
            embed: {
                title: "Action Denied",
                description: "You do not have permission to use this command.",
                color: "RED",
                thumbnail: {
                    "url": "https://cdn.upload.systems/uploads/THIJhI8b.png",
                },
                footer: {
                    text: `SecureMM Inc.`,
                    icon_url: `https://cdn.discordapp.com/attachments/965514383344169000/965514406781943829/securemm.png`
                },
                timestamp: new Date()
            }

        })
        if (!args[0])
            return message.channel.send({
                embed: {
                    color: "RED",
                    title: "Error: Invalid Usage",
                    description: "Invalid Usage: `mm!purge <number of messages to delete>`",
                    thumbnail: {
                        "url": "https://cdn.upload.systems/uploads/THIJhI8b.png",
                    },
                    footer: {
                        text: `SecureMM Inc.`,
                        icon_url: `https://cdn.discordapp.com/attachments/965514383344169000/965514406781943829/securemm.png`
                    },
                    timestamp: new Date()
                }
            })
        if (isNaN(args[0]))
        return message.channel.send({
            embed: {
                color: "RED",
                title: "Error: Invalid Usage",
                description: "Invalid Usage: `mm!purge <number of messages to delete>`",
                thumbnail: {
                    "url": "https://cdn.upload.systems/uploads/THIJhI8b.png",
                },
                footer: {
                    text: `SecureMM Inc.`,
                    icon_url: `https://cdn.discordapp.com/attachments/965514383344169000/965514406781943829/securemm.png`
                },
                timestamp: new Date()
            }
        })
        if (args[0] > 100)
            args[0] = 100;
        message.channel.bulkDelete(args[0])
        message.channel.send({
            embed: {
                title: "Action successful!",
                description: `Successfully deleted ${args[0]} messages.`,
                color: "GREEN",
                thumbnail: {
                    "url": "https://cdn.upload.systems/uploads/JXqttQfy.png"
                },
                footer: {
                    text: `SecureMM Inc.`,
                    icon_url: `https://cdn.discordapp.com/attachments/965514383344169000/965514406781943829/securemm.png`
                },
                timestamp: new Date()
            }
        })
    }



    if (command === "removeuser") {
        //verify that the user has the correct permissions
        if (!message.member.roles.cache.has("964236519307100182")) 
        return message.channel.send({
            embed: {
                title: "Action Denied",
                description: "You do not have permission to use this command.",
                color: "RED",
                thumbnail: {
                    "url": "https://cdn.upload.systems/uploads/THIJhI8b.png",
                },
                footer: {
                    text: `SecureMM Inc.`,
                    icon_url: `https://cdn.discordapp.com/attachments/965514383344169000/965514406781943829/securemm.png`
                },
                timestamp: new Date()
            }

        })

        const mentionedMember = message.mentions.members.first() || message.guild.members.cache.find((user) => user.id === args[0])
        if (!mentionedMember) return message.channel.send({
            embed: {
                color: "RED",
                title: "Error: Invalid Usage",
                description: "Invalid Usage: `mm!removeuser <@user/userId>`",
                thumbnail: {
                    "url": "https://cdn.upload.systems/uploads/THIJhI8b.png",
                },
                footer: {
                    text: `SecureMM Inc.`,
                    icon_url: `https://cdn.discordapp.com/attachments/965514383344169000/965514406781943829/securemm.png`
                },
                timestamp: new Date()
            }
        })
        message.channel.createOverwrite(mentionedMember, {
            VIEW_CHANNEL: false,
            SEND_MESSAGES: false
        })
        message.channel.send({
            embed: {
                title: `Action successful!`,
                description: `Successfully removed **${mentionedMember}** from ${message.channel}.`,
                color: "GREEN",
                thumbnail: {
                    url: `https://cdn.upload.systems/uploads/JXqttQfy.png`
                },
                footer: {
                    text: `SecureMM Inc.`,
                    icon_url: `https://cdn.discordapp.com/attachments/965514383344169000/965514406781943829/securemm.png`
                },
                timestamp: new Date()
            }
        })
    }



    if (command === "adduser") {
        //verify that the user has the correct permissions
        if (!message.member.roles.cache.has("964236519307100182")) 
        return message.channel.send({
            embed: {
                title: "Action Denied",
                description: "You do not have permission to use this command.",
                color: "RED",
                thumbnail: {
                    "url": "https://cdn.upload.systems/uploads/THIJhI8b.png",
                },
                footer: {
                    text: `SecureMM Inc.`,
                    icon_url: `https://cdn.discordapp.com/attachments/965514383344169000/965514406781943829/securemm.png`
                },
                timestamp: new Date()
            }

        })

        const mentionedMember = message.mentions.members.first() || message.guild.members.cache.find((user) => user.id === args[0])
        if (!mentionedMember) return message.channel.send({
            embed: {
                color: "RED",
                title: "Error: Invalid Usage",
                description: "Invalid Usage: `mm!adduser <@user/userId>`",
                thumbnail: {
                    "url": "https://cdn.upload.systems/uploads/THIJhI8b.png",
                },
                footer: {
                    text: `SecureMM Inc.`,
                    icon_url: `https://cdn.discordapp.com/attachments/965514383344169000/965514406781943829/securemm.png`
                },
                timestamp: new Date()
            }
        })
        //if the mentioned member is already in the channel, return an error
        const hasPermissionInChannel = message.channel
            .permissionsFor(mentionedMember)
            .has('SEND_MESSAGES', true);

        if (hasPermissionInChannel) return message.channel.send({
            embed: {
                title: "Error: Already a member",
                description: "The user is already a member of this channel.",
                color: "RED",
                thumbnail: {
                    "url": "https://cdn.upload.systems/uploads/THIJhI8b.png",
                },
                footer: {
                    text: `SecureMM Inc.`,
                    icon_url: `https://cdn.discordapp.com/attachments/965514383344169000/965514406781943829/securemm.png`
                },
                timestamp: new Date()
            }
        })
        message.channel.createOverwrite(mentionedMember, {
            VIEW_CHANNEL: true,
            SEND_MESSAGES: true
        })
        message.channel.send({
            embed: {
                title: `Action successful!`,
                description: `Successfully added **${mentionedMember}** to ${message.channel}.`,
                color: "GREEN",
                thumbnail: {
                    url: `https://cdn.upload.systems/uploads/JXqttQfy.png`
                },
                footer: {
                    text: `SecureMM Inc.`,
                    icon_url: `https://cdn.discordapp.com/attachments/965514383344169000/965514406781943829/securemm.png`
                },
                timestamp: new Date()
            }
        })
    }

    if (command === "help"){
        message.channel.send({
            embed: {
                title: "Help",
                description: "Here are the commands you can use:",
                color: "YELLOW",
                thumbnail: {
                    "url": "https://cdn.upload.systems/uploads/ZoZonHJi.png"
                },
                footer: {
                    text: `SecureMM Inc.`,
                    icon_url: `https://cdn.discordapp.com/attachments/965514383344169000/965514406781943829/securemm.png`
                },
                timestamp: new Date(),
                fields: [
                    {
                        name: "`mm!help`",
                        value: "Displays this message."
                    },
                    {
                        name: "`mm!ping`",
                        value: "Displays the bot's ping."
                    },
                    {
                        name: "`mm!kick <@user/userId> [reason]`",
                        value: "Kicks the user from the server."
                    },
                    {
                        name: "`mm!ban <@user/userId> [reason]`",
                        value: "Bans the user from the server."
                    },
                    {
                        name: "`mm!unban <@user/userId>`",
                        value: "Unbans the user from the server."
                    },
                    {
                        name: "`mm!mute <@user/userId> [reason]`",
                        value: "Mutes the user."
                    },
                    {
                        name: "`mm!unmute <@user/userId>`",
                        value: "Unmutes the user."
                    },
                    {
                        name: "`mm!warn <@user/userId> [reason]`",
                        value: "Warns the user for a reason."
                    },
                    {
                        name: "`mm!adduser <@user/userId>`",
                        value: "Adds a user to the channel."
                    },
                    {
                        name: "`mm!removeuser <@user/userId>`",
                        value: "Removes a user from the channel."
                    },
                    {
                        name: "`mm!close`",
                        value: "Closes the ticket."
                    },
                    {
                        name: "`mm!transcript`",
                        value: "Transcribes the ticket."
                    },
                    {
                        name: "`mm!purge <number>`",
                        value: "Bulk deletes `n` messages."
                    }
                ]
            }
        })
    }
    if (command === "profile" || command === "p") {
        const member = message.mentions.members.first() || message.guild.members.cache.find(m => m.user.id === args[0]);
        if (!member) {
            return message.channel.send({
                embed: {
                    color: "RED",
                    title: "Error: Invalid Usage",
                    description: "Invalid Usage: `mm!profile <@user/userId>`",
                    thumbnail: {
                        "url": "https://cdn.upload.systems/uploads/THIJhI8b.png",
                    },
                    footer: {
                        text: `SecureMM Inc.`,
                        icon_url: `https://cdn.discordapp.com/attachments/965514383344169000/965514406781943829/securemm.png`
                    },
                    timestamp: new Date()
                }
            });
        }
        if (!member.roles.cache.has("964236519307100182")) return message.channel.send({
            embed: {
                color: "RED",
                title: "Error: Member is not an mm",
                description: "The member you mentioned is not a registered middleman",
                thumbnail: {
                    "url": "https://cdn.upload.systems/uploads/THIJhI8b.png",
                },
                footer: {
                    text: `SecureMM Inc.`,
                    icon_url: `https://cdn.discordapp.com/attachments/965514383344169000/965514406781943829/securemm.png`
                },
                timestamp: new Date()
            }
        })
        const foundMM = await mmMongo.findOne({ userId: member.user.id });
        message.channel.send({
            embed: {
                color: "GREEN",
                title: `Profile for ${member.user.username}`,
                fields: [
                    {
                        name: "Rating",
                        value: foundMM.rating
                    },
                    {
                        name: "Vouches",
                        value: foundMM.vouches.length
                    }
                ],
                description: `**Recent Vouches**:\n${foundMM.vouches.map((vouch, index) => `(**${index}**)${vouch.comment}`).join("\n")}`,
                thumbnail: {
                    url: member.user.displayAvatarURL({ dynamic: true })
                },
                footer: {
                    text: `SecureMM Inc.`,
                    icon_url: `https://cdn.discordapp.com/attachments/965514383344169000/965514406781943829/securemm.png`
                },
                timestamp: new Date()
            }
        })
    }
    if (command === "delete") {
        let userId = args[0]
        let vouchId = args[1]
        const foundMm = await mmMongo.findOne({ userId: userId })
        if (!foundMm) return message.channel.send("mm not found")
        const foundVouch = await findIndex(foundMm.vouches, vouchId)
        await mmMongo.updateOne({ userId: userId }, { $pop: {
            vouches: foundVouch + 1
        } })
        message.channel.send("Vouch deleted: " + vouchId)
    }
})
client.login(process.env.TOKEN);

module.exports = {
    getMmList,
    createTicket,
    sendMessage,
    sendMsg,
    addMemberToGuild
}