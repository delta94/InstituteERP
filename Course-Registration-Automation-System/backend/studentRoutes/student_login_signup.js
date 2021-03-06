const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const checkAuth = require('../middleware/check_auth_student');

// in this file student while logging in will generate jwt token for authrized access to some apis.
var salt = 7;
var secret_key = 'secret_key_student';

const Student = require('../models/student.model');

router.post('/signup', (req, res, next) => {
    // console.log(req.body)
    Student.find({email: req.body.email})
    .exec()
    .then(student => {
        if(student.length >= 1){
            res.status(409).json({
                message: 'Email Already Exists!'
            });
        }
        else{
            bcrypt.hash(req.body.password, salt, (err, hash) => {
                if (err) {
                    return res.status(500).json({
                        error: err
                    });
                }
                else{
                    const student = new Student({
                        _id : mongoose.Types.ObjectId(),
                        email: req.body.email,
                        password: hash,
                        name: req.body.name,
                        department: req.body.department,
                        roll_num: req.body.roll_num
                    });
                    student.save().then(result => {
                        // console.log(result)
                        res.status(201).json({
                            message: 'Student Added'
                        });
                    }).catch(err => {
                        // console.log(err);
                        res.status(500).json({
                            error: err
                        });
                    });
                }
            });
        }
    })
    .catch()
});

router.post('/login', (req, res, next) => {
    // console.log(req);
    Student.find({email: req.body.email})
    .exec()
    .then(student => {
        if(student.length<1){
            return res.status(401).json({
                message: 'Auth Failed'
            });
        }
        // console.log(student);
        bcrypt.compare(req.body.password, student[0].password, (err, result) => {
            if (err) {
                return res.json({
                    message: "Auth Failed"
                });
            }
            if (result) {
                const token = jwt.sign({
                    email: student[0].email,
                    studentId: student[0]._id
                }, 
                secret_key
                // {
                    // expiresIn: "1h"}
                );
                return res.status(200).json({
                    message: 'Auth Successful',
                    token: token,
                    email: student[0].email,
                    name: student[0].name,
                    department: student[0].department,
                    roll_num: student[0].roll_num
                });
            }
            
                res.json({
                    message: 'Auth Failed',
                });
        });
    })
    .catch(err => {
        // console.log(err);
        res.status(500).json({
            error: err
        });
    });
});




router.delete('/:studentId', (req, res, next) => {
    Student.deleteOne({_id:req.params.studentId})
    .exec()
    .then(result => {
        if(result.length >= 1){
            res.status(200).json({
                message: 'Student Details Removed'
            });
        }
        else{
            res.status(409).json({
                message: 'Invalid StudentId'
            });
        }
    })
    .catch(err => {
        // console.log(err);
        res.status(500).json({
            error: err
        });
    });
});


module.exports = router;