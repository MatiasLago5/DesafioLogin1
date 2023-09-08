const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');

router.get('/register', (req, res) => {
  if (req.session.user) {
    return res.redirect('/profile');
  }
  res.render('register');
});

router.post('/register', async (req, res) => {
  const { first_name, last_name, email, age, password } = req.body;
  if (req.session.user) {
    return res.redirect('/profile');
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('register', { error: 'El correo electrónico ya está registrado' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      first_name,
      last_name,
      email,
      age,
      password: hashedPassword,
    });
    await newUser.save();
    req.session.user = newUser;
    res.redirect('/profile');
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Error interno del servidor' });
  }
});

router.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/profile');
  }
  res.render('login');
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (req.session.user) {
    return res.redirect("/api/sessions/profile");
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.render("login", { error: "Credenciales incorrectas" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      if (user.email === "adminCoder@coder.com" && password === "adminCod3r123") {
        user.role = "admin";
      }

      req.session.user = user;
      res.redirect("/profile");
    } else {
      res.render("login", { error: "Credenciales incorrectas" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).render("error", { message: "Error interno del servidor" });
  }
});


router.get('/profile', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.render('profile', { user: req.session.user });
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;