const {obtainAllPosts, obtainPostById} = require('../services/get.service');


//Controlador para obtener todos los posts 
const getAllPosts = async (req, res, next) =>{
  try {
    const posts = await obtainAllPosts();
    return res.status(200).json(posts);
  } catch (error) {
    console.error('Error en getAll controller:', error);
    return res.status(500).json({ message: 'Error interno del servidor al obtener los posts.' });
  }
}
//Controlador para obtener un post por id
const getPostById = async (req, res, next) =>{
  const { id } = req.params;
  try {
    const post = await obtainPostById(id)
    if (!post){
      res.status(404).json({
        message:`El post con ID ${id} no existe`
      })
    }
    return res.status(200).json(post);
  } catch (error) {
    console.error('Error en getAll controller:', error);
    return res.status(500).json({ message: 'Error interno del servidor al obtener los posts.' });
  }
}

module.exports = {getAllPosts, getPostById}