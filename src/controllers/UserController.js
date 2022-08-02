const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcrypt');

function fixZero(time) {
    return time < 10 ? `0${time}` : time;
}

module.exports = {
    signin: async (req, res) => {
        let { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            res.json({
                error: 'Usuário inválido!'
            });
            return;
        }
        const match = await bcrypt.compare(password, user.passwordHash);
        if (!match) {
            res.json({
                error: 'Usuário inválido!'
            });
            return;
        }
        res.json({
            data: user,
            msg: 'Login feito com sucesso!',
            error: null
        });
    },
    signup: async (req, res) => {
        let { avatar, nome, nick, email, password, score, ranking, timeGame, conquistas } = req.body;
        const user = await User.findOne({ email });
        if (user) {
            res.json({
                error: 'Usuário inválido!'
            });
            return;
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = new User({
            avatar,
            nome,
            nick,
            email,
            passwordHash,
            score,
            ranking,
            timeGame,
            conquistas
        });

        const userSave = await newUser.save();
        if (userSave) {
            res.json({
                data: userSave,
                msg: 'Usuario salvo com sucesso',
                error: null
            });
            return;
        }
    },
    update: async (req, res) => {
        const id = req.params.id;
        let { avatar, nome, nick, email } = req.body;
        const user = User.findByIdAndUpdate(id, { nome, avatar, nick, email }).exec();
        if (!user) {
            res.json({ error: 'Usuário invalido!' });
            return;
        }
        res.json({ msg: 'Usuário alterado com sucesso' });

    },
    timeGame: async (req, res) => {
        const id = req.params.id;
        const newTimeGame = req.params.timeGame;

        const user = await User.findById(id).exec();
        if (!user) {
            res.json({ error: 'Usuário inválido!' });
            return;
        }
        const timeGameAtual = user.timeGame.split(':');
        const segundosAtual = parseInt(timeGameAtual[2]);
        const minutosAtual = parseInt(timeGameAtual[1]) * 60;
        const horasAtual = parseInt(timeGameAtual[0]) * 3600;
        const totalSegundosAtual = horasAtual + minutosAtual + segundosAtual;

        const dateObj = new Date((parseInt(newTimeGame) + totalSegundosAtual) * 1000);
        const horas = dateObj.getUTCHours();
        const minutos = dateObj.getUTCMinutes();
        const segundos = dateObj.getUTCSeconds();

        let sMinutos = fixZero(minutos);
        let sSegundos = fixZero(segundos)
        let sHoras = fixZero(horas);
        /*
        res.json(
            {
                time: `${sHoras}:${sMinutos}:${sSegundos}`,
                atual: timeGameAtual
            });
        */
        const timeGame = `${sHoras}:${sMinutos}:${sSegundos}`;
        const userUpdate = await User.findByIdAndUpdate(id, { timeGame });
        if (!userUpdate) {
            res.json({ error: 'Usuário invalido!' });
            return;
        }
        res.json({ msg: 'Usuário alterado com sucesso' });

    },
    score: async (req, res) => {
        const id = req.params.id;
        const newScore = req.params.score;
        const user = await User.findById(id).exec();
        if (!user) {
            res.json({ error: 'Usuário inválido!' });
            return;
        }
        const scoreAtual = user.score;
        //const score = parseInt(scoreAtual) + parseInt(newScore);
        if (newScore > scoreAtual) {           
            const userUpdate = await User.findByIdAndUpdate(id, { score: newScore });
            if (!userUpdate) {
                res.json({ error: 'Usuário invalido!' });
                return;
            }
            const geraRanking = await User.aggregate([{
                $setWindowFields: {
                    sortBy: {score: -1},
                    output: {
                        ranking: {
                            $rank: {}
                        }
                    },
                }
               }]).exec();
            geraRanking.map((user) => {
                User.updateOne({_id: user._id},{ranking: user.ranking}).exec();
            });               
            res.json({ msg: 'Usuário alterado com sucesso' });
        } else {
            res.json({ msg: 'noob' });
            return;
        }


    },
    ranking: async (req, res) => {
       const qtd = req.params.qtd;
       const rankingList = 
        await User.find({ranking: {$gt: 0, $ne: 0}})
                  .sort({ranking: 1})
                  .limit(parseInt(qtd))
                  .select({"ranking" : 1, "avatar": 1, "nick": 1, "score": 1, "conquistas": 1, "_id": 0})
                  .exec();
        if(!rankingList) {
            res.json({error: 'Erro ao realizar consulta'});
            return;
        }
        res.json({data: rankingList});
    },
    info: async (req, res) => {
        const id = req.params.id;
        const user = await User.findById(id).exec();
        if(!user) {
            res.json({error: 'Usuário inválido!'});
            return;
        }
        res.json({data: user});
    }
}