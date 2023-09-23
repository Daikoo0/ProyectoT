import { useEffect, useState } from 'react';

function UserProjects() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/users/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
    })
      .then(response => response.json())
      .then(data => {
        setProjects(data.Proyects);
        console.log(data);
      })
      .catch(error => {
        console.error('Error fetching data: ', error);
      });
  }, []);

  return (
    <div>
      <h1>User Projects</h1>
      <ul>
        {projects.map(project => (
          <li key={project}>{project}</li>
        ))}
      </ul>
    </div>
  );
}

export default UserProjects;