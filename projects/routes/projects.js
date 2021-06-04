var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var mongoose = require('mongoose');
var router = express.Router();

const project = mongoose.model('Project');
const user = mongoose.model('User');

/* Overrides */
router.use(bodyParser.urlencoded({ extended: true }))
router.use(methodOverride((req, res) => {
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method;
        delete req.body._method;
        return method;
      }
}));

// GET all projects
router.get('/', async (req, res, next) => {
    if(!req.session['userId']) {
        return res.redirect('/users/login');
    }
    const allProjects = await project.find({ isArchived: false });
    res.format({
      html: () => res.render('projects/index', { title: 'All projects', projects: allProjects, viewType: 0 }),
      json: () => { res.json(allProjects) }
    });
});

// GET all projects (author)
router.get('/author', async (req, res, next) => {
    if(!req.session['userId']) {
        return res.redirect('/users/login');
    }
    const allProjects = await project.find({ author: req.session['userId'], isArchived: false });
    res.format({
      html: () => res.render('projects/index', { title: 'Your projects (Author)', projects: allProjects, viewType: 1 }),
      json: () => { res.json(allProjects) }
    });
});

// GET all projects (member)
router.get('/member', async (req, res, next) => {
    if(!req.session['userId']) {
        return res.redirect('/users/login');
    }
    const allProjects = await project.find({ isArchived: false });
    const projects = [];

    allProjects.forEach((project) => {
        if(project.members.indexOf(req.session['userId']) != -1) {
            projects.push(project);
        }
    });

    res.format({
      html: () => res.render('projects/index', { title: 'Your projects (Member)', projects: projects, viewType: 2 }),
      json: () => { res.json(allProjects) }
    });
});

// GET all projects (archive)
router.get('/archive', async (req, res, next) => {
    if(!req.session['userId']) {
        return res.redirect('/users/login');
    }
    const allProjects = await project.find({ isArchived: true });
    const projects = [];

    allProjects.forEach((project) => {
        if(project.members.indexOf(req.session['userId']) != -1 || project.author == req.session['userId']) {
            projects.push(project);
        }
    });

    res.format({
      html: () => res.render('projects/index', { title: 'Project Archive', projects: projects, viewType: 0 }),
      json: () => { res.json(allProjects) }
    });
});

// POST new project
router.post('/', async (req, res) => {
    req.body.isArchived = false;
    const savedProject = await project.create(req.body);
    console.log(`[POST] Done saving new project titled: ${req.body.title}!`);

    res.format({
        html: () => {
            res.location('projects');
            res.redirect('/projects');
        },
        json: () => res.json(savedProject)
    });
});

// GET show new project form
router.get('/new', async (req, res) => {
    if(!req.session['userId']) {
        return res.redirect('/users/login');
    }
    const users = await user.find({});
    res.render('projects/new', { 
        title: 'Add new project', 
        users: users.filter(u => u._id != req.session['userId']),            // Do not show logged user,
        userId: req.session['userId']
    });
});

// GET project show view
router.get('/show/:id/', async (req, res) => {
    if(!req.session['userId']) {
        return res.redirect('/users/login');
    }
    const loadedProject = await project.findById(req.params.id);
    res.render('projects/show', { title: 'Project', project: loadedProject });
});

// DELETE project based on _id
router.delete('/:id/', async (req, res) => {
    if(!req.session['userId']) {
        return res.redirect('/users/login');
    }
    const deletedProject = await project.findByIdAndRemove(req.params.id)
    console.log(`[DELETE] Done deleting project titled: ${deletedProject.title}!`);
    res.format({
        html: () => res.redirect('/projects'),
        json: () => res.json({ message: 'Project deleted', item: deletedProject })
    });
});

// GET project edit view
router.get('/edit/:id/', async (req, res) => {
    if(!req.session['userId']) {
        return res.redirect('/users/login');
    }
    let users = await user.find({});
    const loadedProject = await project.findById(req.params.id);

    const selectedUsers = [];
    let viewType = 1;
    users = users.filter(u => u._id != req.session['userId']);

    for(let i = 0; i < users.length; i++) {
        loadedProject.members.forEach(m => {
            if(m == req.session['userId']) {
                viewType = 2;
            }

            if(users[i]._id == m) {
                selectedUsers.push('selected');
            }
            else {
                selectedUsers.push('');
            }
        });
    }

    res.render('projects/edit', { 
        title: 'Edit project',
        project: loadedProject,
        users: users,            // Do not show logged user
        selected: selectedUsers,
        viewType: viewType
    });
});

// EDIT project based on _id
router.put('/edit/:id/', async (req, res) => {
    
    req.body.isArchived = req.body.isArchived == 'on' ? true : false;
    const editedProject = await project.findByIdAndUpdate(req.params.id, req.body);
    console.log(`[PUT] Done editign project titled: ${editedProject.title}!`);

    res.format({
        html: () => res.redirect('/projects'),
        json: () => res.json({ message: 'Project edited', item: editedProject })
    });
});

module.exports = router;
