document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registrar');
  const input = form.querySelector('input');

  const mainDiv = document.querySelector('.main');
  const ul = document.getElementById('invitedList');

  const div = document.createElement('div');
  const filterLabel = document.createElement('label');
  const filterCheckBox = document.createElement('input');

  filterLabel.textContent = "Ocultar los que no hayan respondido";
  filterCheckBox.type = 'checkbox';
  div.appendChild(filterLabel);
  div.appendChild(filterCheckBox);
  mainDiv.insertBefore(div, ul);
  filterCheckBox.addEventListener('change', (e) => {
    const isChecked = e.target.checked;
    const lis = ul.children;
    if (isChecked) {
      for (let i = 0; i < lis.length; i += 1) {
        let li = lis[i];
        
        if (li.className === 'responded') {
          li.style.display = '';
        } else {
          li.style.display = 'none';
        }
      }
    } else {
      for (let i = 0; i < lis.length; i += 1) {
        let li = lis[i];
        li.style.display = '';
      }
    }
  });

  function createLI(invId, text, isChecked) {
    function createElement(elementName, property, value) {
      const element = document.createElement(elementName);
      element[property] = value;
      
      return element;
    }

    function appendToLI(elementName, property, value) {
      const element = createElement(elementName, property, value);
      li.appendChild(element);
      return element;
    }

    const li = document.createElement('li');
    li.dataset.invId = invId;
    
    if (isChecked) {
      li.className = 'responded';
    } else {
      li.className = '';
    }
    
    var checkbox = createElement('input', 'type', 'checkbox');
    checkbox.checked = isChecked;
    
    appendToLI('span', 'textContent', text);
    appendToLI('label', 'textContent', 'Confirmed')
      .appendChild(checkbox);
    appendToLI('button', 'textContent', 'edit');
    appendToLI('button', 'textContent', 'remove');
    return li;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const text = input.value;
    
    if (text == '') {
      return;
    }
    
    input.value = '';
    
    var lastElement = invitedList.lastChild;
    
    var newId = (lastElement == null ? 1 : (parseInt(lastElement.dataset.invId) + 1));
    
    const li = createLI(newId, text, false);
    ul.appendChild(li);
    
    sendInvite(text);
  });

  ul.addEventListener('change', (e) => {
    const checkbox = e.target;
    const checked = checkbox.checked;
    const listItem = checkbox.parentNode.parentNode;
    
    var id = checkbox.parentNode.parentNode.dataset.invId;
    
    // null if editing
    if (id != null) {
      setConfirmed(id, checked);
    }
    
    if (checked) {
      listItem.className = 'responded';
    } else {
      listItem.className = '';
    }
  });

  ul.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
      const button = e.target;
      const li = button.parentNode;
      const ul = li.parentNode;
      const action = button.textContent;
      const nameActions = {
        remove: () => {
          ul.removeChild(li);
          
          removeInv(li.dataset.invId);
        },
        edit: () => {
          const span = li.firstElementChild;
          const input = document.createElement('input');
          input.type = 'text';
          input.value = span.textContent;
          li.insertBefore(input, span);
          li.removeChild(span);
          button.textContent = 'save';
        },
        save: () => {
          const input = li.firstElementChild;
          const span = document.createElement('span');
          span.textContent = input.value;
          li.insertBefore(span, input);
          li.removeChild(input);
          button.textContent = 'edit';
          
          updateName(li.dataset.invId, input.value)
        }
      };

      // select and run action in button's name
      nameActions[action]();
    }
  });
  
  
  
  /*
   * XMLHttpRequest
   */
  const entryPoint = "http://localhost:3000/invitados";
  
  var data;
  
  async function requestNovios() {
    promise = await new Promise((resolve, reject) => {
      var xhttp = new XMLHttpRequest();
      xhttp.onload = () => {
        if (xhttp.status >= 200 && xhttp.status < 300) {
            resolve(xhttp.response);
        } else {
            reject(xhttp.statusText);
        }
      };
      xhttp.open("GET", entryPoint, true);
      xhttp.send();
    });
    
    return promise;
  };
  
  var promiseResult = requestNovios();
  
  promiseResult.then(responseData => {
    data = JSON.parse(responseData);
    
    data.forEach(thisData => {
      const li = createLI(thisData.id, thisData.nombre, thisData.confirmado);
      ul.appendChild(li);
    });
  })
  .catch(error => {
      console.log(error);
  });
  
  async function sendInvite(newName) {
    var newData = JSON.stringify({
      nombre: newName,
      confirmado: false
    });
    
    sendData('POST', null, newData);
  }
  
  async function updateName(id, newName) {
    var newData = JSON.stringify({
      id: id,
      nombre: newName,
    });
    
    sendData('PATCH', id, newData);
  }
  
  async function setConfirmed(id, confirmed) {
    var newData = JSON.stringify({
      id: id,
      confirmado: confirmed
    });
    
    sendData('PATCH', id, newData);
  }
  
  async function removeInv(id) {
    sendData('DELETE', id, '');
  }
  
  function sendData(requestType, id, newData) {
    var xPost = new XMLHttpRequest();
    xPost.open(requestType, (id == null ? entryPoint : entryPoint + '/' + id), true);
    xPost.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xPost.send(newData);
  }
});
