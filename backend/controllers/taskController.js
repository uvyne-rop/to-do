//handles HTTP requests to create a task for a specific user.

exports.createTask = async (req, res) => {
  try {
    const userId = req.userId;
    const { title, completed, important, myDay, list, date, time } = req.body;

    // ADD THESE LOGS
    console.log('📥 CREATE TASK REQUEST');
    console.log('👤 User ID:', userId);
    console.log('📝 Task data:', { title, list, myDay, completed });  //Prints info about the request to help debug issues.

    if (!title || title.trim() === '') {
      console.log('❌ Validation failed: No title');
      return res.status(400).json({
        success: false,
        error: 'Task title is required'
      });
    }  //Ensures every task has a title...Returns an error if missing.


//Creates the task data with default values.
    const taskData = {
      title: title.trim(),
      completed: completed || false,
      important: important || false,
      myDay: myDay || false,
      list: list || 'personal',
      date: date || null,
      time: time || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    console.log('💾 Writing to Firestore path:', `users/${userId}/tasks`);
    
    const docRef = await getTasksCollection(userId).add(taskData);
    
    console.log('✅ Task created with ID:', docRef.id);
    console.log('🔥 Full Firestore path:', `users/${userId}/tasks/${docRef.id}`);

    const taskDoc = await docRef.get();
    
    res.status(201).json({
      success: true,
      task: {
        id: docRef.id,
        ...taskDoc.data(),
        createdAt: taskDoc.data().createdAt?.toDate().toISOString(),
        updatedAt: taskDoc.data().updatedAt?.toDate().toISOString()
      }
    });
    
    console.log('📤 Response sent successfully');
    
  } catch (error) {   //Catches any error and sends a 500 response with error details.
    console.error('❌ CREATE TASK ERROR:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      error: 'Failed to create task',
      details: error.message // Remove in production
    });
  }
};