import axios from 'axios';
import Swal from 'sweetalert2';

document.addEventListener('DOMContentLoaded', () =>{
    const skills = document.querySelector('.lista-conocimientos');

    // clear alerts 
    let alerts = document.querySelector('.alertas');

    if(alerts){
        cleanAlerts();
    }

    if(skills){
        skills.addEventListener('click', addSkills);

        // once on Edit, call function ;
        skillsSelected();
    }

    const openingsList = document.querySelector('.panel-administracion');

        if(openingsList){
            openingsList.addEventListener('click', accionList);
        }
});

const skills = new Set();
const addSkills = e =>{
    if(e.target.tagName === "LI"){
        if(e.target.classList.contains('activo')){
            // eliminate form SET and take off the class
            skills.delete(e.target.textContent);
            e.target.classList.remove('activo');
        }else {
            // add to SET and add the Class
            skills.add(e.target.textContent);
            e.target.classList.add('activo');
        }
    }
    const skillsArray = [...skills];
    document.querySelector('#skills').value = skillsArray;
}


const skillsSelected = () =>{
    const selected = Array.from(document.querySelectorAll('.lista-conocimientos .activo'));

    selected.forEach(select => {
        skills.add(select.textContent);
    })
   
    // place them in the hidden
    
const skillsArray = [...skills];
document.querySelector('#skills').value = skillsArray;
}

const cleanAlerts = () =>{
    const alerts = document.querySelector('.alertas');

    const interval = setInterval(()=>{
        if(alerts.children.length > 0){
                alerts.removeChild(alerts.children[0]);
        }else if(alerts.children.length === 0){
            alerts.parentElement.removeChild(alerts);
            clearInterval(interval);
            }
    }, 2000);    
}


//  Eliminate Openings

const accionList = e =>{
    e.preventDefault();

    if(e.target.dataset.delete){
        // eliminate with axios

        
        Swal.fire({
            title: 'Confirm Delete?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#00C897',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, Cancel'
          }).then((result) => {
            if (result.value) {

                // sending petition with axios
            const url = `${location.origin}/openings/eliminate/${e.target.dataset.delete}`;

                // Axios for eliminate record
                axios.delete(url, { params: {url}})
                    .then(function(answer){
                        if(answer.status === 200){
                           Swal.fire(
                                'Deleted!',
                                answer.data,
                                'success'
                            );

                            // ALL eliminate from DOM
                            e.target.parentElement.parentElement.parentElement.removeChild(e.target.parentElement.parentElement);
                        }
                    })
                    .catch(() =>{
                        Swal.fire({
                            type: 'error',
                            title: 'was an error',
                            text: 'unable to eliminate'
                        })
                    })
                }
          })

    }else if(e.target.tagName === 'A'){

        window.location.href = e.target.href;
    }
}