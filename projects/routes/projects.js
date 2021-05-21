var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var mongoose = require('mongoose');
var router = express.Router();

const project = mongoose.model('Project');

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
  const allProjects = await project.find();
  res.format({
    html: () => res.render('projects/index', { title: 'All projects', projects: allProjects }),
    json: () => { res.json(allProjects) }
  });
});

// POST new project
router.post('/', async (req, res) => {
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
router.get('/new', (req, res) => {
    res.render('projects/new', { title: 'Add new project' });
});

// DELETE project based on _id
router.delete('/:id/', async (req, res) => {

    const deletedProject = await project.findByIdAndRemove(req.params.id)
    console.log(`[DELETE] Done deleting project titled: ${deletedProject.title}!`);
    res.format({
        html: () => res.redirect('/projects'),
        json: () => res.json({ message: 'Project deleted', item: deletedProject })
    });
});

// GET project edit view
router.get('/edit/:id/', async (req, res) => {
    const loadedProject = await project.findById(req.params.id);
    res.render('projects/edit', { title: 'Edit project', project: loadedProject });
});

// EDIT project based on _id
router.put('/edit/:id/', async (req, res) => {
    console.log(req.body);
    const editedProject = await project.findByIdAndUpdate(req.params.id, req.body);

    console.log(`[PUT] Done editign project titled: ${editedProject.title}!`);
    res.format({
        html: () => res.redirect('/projects'),
        json: () => res.json({ message: 'Project edited', item: editedProject })
    });
});

module.exports = router;
