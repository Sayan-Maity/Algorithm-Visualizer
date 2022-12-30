// prerequisite: javascript, d3.js

// structure of node
// {
//     nodeId: number <--- unique id for each node. it will be also used as id for html element of node.
//     value: character <-- this will store character stored in current node
//     endOfWord: boolean <-- show node as the end of word.
//     children: [] <--- this array will store all the children nodes and its values
//     childrenCharacter : {} <-- this will store all children character.
// }

// Tree will be stored as object.
let data = { nodeId: 0, value: 'root', endOfWord: false, children: [], childrenCharacter: {} };
// Current available id for the node. We will give each node a unique id and put this as their html element "id".
let curId = 1;

const width = Math.max(100, window.innerWidth - 50);
const height = Math.max(100, window.innerHeight - 200);
const nodeRadius = 20;
const LinkStroke = 4;
const animationDuration = 500;
const padding = 40;

d3.select('.Canvas').append('svg').append('g');

// During insertion or deletion visualization process disbale the buttons
const freezeButtons = () => {
  document.getElementById('InsertButton').disabled = true;
  document.getElementById('DeleteButton').disabled = true;
};
const unfreezeButtons = () => {
  document.getElementById('InsertButton').disabled = false;
  document.getElementById('DeleteButton').disabled = false;
};

// To put delay between visualization.
const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// Create the root node.
const init = () => {
  const treemap = d3.tree().size([width, height]);
  const newTree = treemap(d3.hierarchy(data, (d) => d.children));

  newTree.y += padding;

  const nodes = d3
    .select('.Canvas > svg g')
    .selectAll('g.node')
    .data(newTree)
    .enter()
    .append('g')
    .attr('class', () => 'node');
  nodes
    .append('circle')
    .attr('id', (d) => `circle${d.data.nodeId}`)
    .attr('r', nodeRadius)
    .attr('cx', (d) => d.x)
    .attr('cy', (d) => d.y)
    .attr('value', (d) => d.data.value);
  nodes
    .append('text')
    .attr('dx', (d) => d.x)
    .attr('dy', (d) => d.y)
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline', 'middle')
    .attr('font-size', '20px')
    .attr('font-weight', 'bold')
    .text((d) => d.data.value);
};
init();

// To animate from old tree to new tree.
const update = (oldData, newData, parentId, childId) => {
  // childId is node we want to insert/delete and parentId is parent of node we want to insert/delete.

  /*
    Small description of "update" function.
     -> Find the co-ordinates of old tree.
     -> Find the co-ordinates of new updated tree.
     -> Put tree on old co-ordinates.
     -> Animate nodes and links to the new co-ordinates.
  */

  // Create the old and new updated tree.
  const treemap = d3.tree().size([width, height]);
  const oldTree = treemap(d3.hierarchy(oldData, (d) => d.children));
  const newTree = treemap(d3.hierarchy(newData, (d) => d.children));
  // Convert both trees from javascript objects to array.
  let oldTreeArray = oldTree.descendants();
  let newTreeArray = newTree.descendants();

  // Putting old and new co-ordinates of nodes in the same array.
  for (let i = 0; i < newTreeArray.length; i++) {
    let oldPosition = {};
    // Traverse the old tree and find the old co-ordinates.
    for (let j = 0; j < oldTreeArray.length; j++) {
      if (newTreeArray[i].data.nodeId == childId) {
        // Node which we are going to insert, there is no old co-oridnates available
        // So we are going to use the co-ordinates of parent node.
        if (oldTreeArray[j].data.nodeId == parentId) {
          oldPosition = oldTreeArray[j];
        }
      } else {
        if (oldTreeArray[j].data.nodeId == newTreeArray[i].data.nodeId) {
          oldPosition = oldTreeArray[j];
        }
      }
    }
    newTreeArray[i].oldX = oldPosition.x || 0;
    newTreeArray[i].oldY = (oldPosition.y || 0) + padding;
    newTreeArray[i].y += padding;
  }

  // Remove the old tree from canvas. we will draw new one.
  d3.select('.Canvas > svg g').remove();
  d3.select('.Canvas > svg').append('g');

  // Create all the edges and put them in new array.
  let allLinks = [];
  for (let i = 0; i < newTreeArray.length; i++) {
    if (!newTreeArray[i].children) continue;
    for (let j = 0; j < newTreeArray[i].children.length; j++) {
      allLinks.push({
        parent: newTreeArray[i],
        child: newTreeArray[i].children[j],
      });
    }
  }

  // Drawing edges on canvas with some styles and co-ordinates.
  const links = d3
    .select('.Canvas > svg g')
    .selectAll('g.link')
    .data(allLinks)
    .enter()
    .append('g')
    .append('line')
    .attr('id', (d) => `link${d.parent.data.nodeId}D${d.child.nodeId}`)
    .attr('stroke-width', LinkStroke)
    .attr('stroke', 'black')
    .attr('x1', (d) => d.parent.oldX)
    .attr('y1', (d) => d.parent.oldY)
    .attr('x2', (d) => d.child.oldX)
    .attr('y2', (d) => d.child.oldY);
  // Transition from old tree to new tree. move old edges to new edges using co-ordinates.
  links
    .transition()
    .duration(animationDuration)
    .attr('x1', (d) => d.parent.x)
    .attr('y1', (d) => d.parent.y)
    .attr('x2', (d) => d.child.x)
    .attr('y2', (d) => d.child.y);

  // Draw nodes and their value on screen using old tree co-ordinates.
  const nodes = d3
    .select('.Canvas > svg g')
    .selectAll('g.node')
    .data(newTree)
    .enter()
    .append('g')
    .attr('id', (d) => `node${d.data.nodeId}`)
    .attr('class', (d) => (d.data.endOfWord ? 'endOfWordNode' : 'node'));
  nodes
    .append('circle')
    .attr('id', (d) => `circle${d.data.nodeId}`)
    .attr('r', nodeRadius)
    .attr('cx', (d) => d.oldX)
    .attr('cy', (d) => d.oldY)
    .attr('value', (d) => d.data.value);
  nodes
    .append('text')
    .attr('dx', (d) => d.oldX)
    .attr('dy', (d) => d.oldY)
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline', 'middle')
    .attr('fill', 'white')
    .attr('font-size', '20px')
    .attr('font-weight', 'bold')
    .text((d) => d.data.value);

  // Move nodes from old co-ordinate to new co-ordinates.
  nodes
    .transition()
    .duration(animationDuration)
    .attr('transform', function (d) {
      if (d.data.value != null) return `translate(${parseInt(d.x - d.oldX)}, ${parseInt(d.y - d.oldY)})`;
      else return 'translate(0,0)';
    });

  data = newData;
};

const addNode = async () => {
  // Get the node value from input field and verify it's value/type.
  let str = document.getElementById('InsertNodeField').value;
  if (str == '') {
    return;
  }
  if (str.length > 12) {
    alert('Word Length should be less than 12.');
    return;
  }
  str = str.toLowerCase();
  document.getElementById('InsertNodeField').value = '';

  // Freeze(disable) insert and delete buttons.
  freezeButtons();

  // Copying object without reference in a dirty way. Might make proper function to copy object later.
  let oldData = JSON.parse(JSON.stringify(data));
  let newData = JSON.parse(JSON.stringify(data));
  let node = newData;

  // Logic of trie insertion with some animation.
  for (let i = 0; i < str.length; i++) {
    if (str[i] in node.childrenCharacter && node.childrenCharacter[str[i]] == true) {
      // Character Node already exits. Just find it and go there.
      for (let j = 0; j < node.children.length; j++) {
        if (node.children[j].value == str[i]) {
          node = node.children[j];
          break;
        }
      }
      if (i == str.length - 1) {
        node.endOfWord = true;
        update(newData, newData, -1, -1);
      }
    } else {
      // Create a node for character. Show node creation animation.
      node.childrenCharacter[str[i]] = true;
      node.children.push({
        nodeId: curId,
        value: str[i],
        endOfWord: i == str.length - 1,
        children: [],
        childrenCharacter: {},
      });
      curId++;
      update(oldData, newData, node.nodeId, node.children[node.children.length - 1].nodeId);
      oldData = JSON.parse(JSON.stringify(newData));
      node = node.children[node.children.length - 1];
    }
    // Show current node in different color(here red).
    const nodeEle = document.getElementById(`node${node.nodeId}`);
    let originalClass = '';
    if (nodeEle) {
      originalClass = nodeEle.className.baseVal;
      nodeEle.className.baseVal = 'highlightedNode';
    }
    await sleep(700);
    // Revert back node to it's original status.
    if (nodeEle) {
      nodeEle.className.baseVal = originalClass;
    }
  }
  unfreezeButtons();
};

const deleteNodeUtil = async () => {
  // If data object has no children then return.
  if (data.children.length == 0) {
    alert('Trie is empty');
    return;
  }
  // Get the word we want to delete from input field.
  let str = document.getElementById('DeleteNodeField').value;
  if (str == '') {
    return;
  }
  str = str.toLowerCase();
  document.getElementById('DeleteNodeField').value = '';

  // Freeze(disable) insert and delete buttons.
  freezeButtons();

  // Copying object without reference in a dirty way. Might make proper function to copy object later.
  const newData = JSON.parse(JSON.stringify(data));

  // Creating another function for deletion because we are going to write recursive logic to delete word.
  const deleteNode = async (parent, node, str, depth) => {
    // Highlight the node which we are currently processing.
    const nodeEle = document.getElementById(`node${node.nodeId}`);
    let originalClass = '';
    if (nodeEle) {
      originalClass = nodeEle.className.baseVal;
      nodeEle.className.baseVal = 'highlightedNode';
    }
    await sleep(700);
    if (nodeEle) {
      nodeEle.className.baseVal = originalClass;
    }

    if (depth == str.length) {
      // If last character of word is being processed
      if (node.endOfWord == false) {
        alert('Word not found in trie');
        return false;
      }
      // This node is no more end of word after removal of given word.
      node.endOfWord = false;

      // If there are still some children to current node
      // Then it means there some words which are ending below.
      // So we cant delete it.
      // Check if current node has some children or not.
      if (node.children.length == 0) {
        // Copying object without reference in a dirty way. Might make proper function to copy object later.
        const oldData = JSON.parse(JSON.stringify(newData));
        // Delete the current node from parent node's "children" and "childrenCharacter" property.
        delete parent.childrenCharacter[str[depth - 1]];
        let charIndex = 0;
        for (let i = 0; i < parent.children.length; i++) {
          if (parent.children[i].value == str[depth - 1]) {
            charIndex = i;
          }
        }
        parent.children.splice(charIndex, 1);
        update(oldData, newData, -1, -1);
      } else {
        update(newData, newData, -1, -1);
      }
      return true;
    }

    // If not last character, call recursively for the next character.
    // obtained using ASCII value
    if (str[depth] in node.childrenCharacter) {
      let charIndex = 0;
      for (let i = 0; i < node.children.length; i++) {
        if (node.children[i].value == str[depth]) {
          charIndex = i;
        }
      }

      const isWordFound = await deleteNode(node, node.children[charIndex], str, depth + 1);
      if (isWordFound == false) {
        return false;
      }

      // Currently we are returning from recursive calls and going back.

      // If current node does not have any child (ts only child got
      // deleted), and it is not end of another word.
      if (parent && node.children.length == 0 && node.endOfWord == false) {
        const nodeEle = document.getElementById(`node${node.nodeId}`);
        if (nodeEle) {
          nodeEle.className.baseVal = 'highlightedNode';
        }
        await sleep(700);

        const oldData = JSON.parse(JSON.stringify(newData));
        // Delete the current node from parent node's "children" and "childrenCharacter" property.
        parent.childrenCharacter[str[depth - 1]] = false;
        charIndex = 0;
        for (let i = 0; i < parent.children.length; i++) {
          if (parent.children[i].value == str[depth - 1]) {
            charIndex = i;
          }
        }
        parent.children.splice(charIndex, 1);
        update(oldData, newData, -1, -1);
      }
      return true;
    } else {
      alert('Word not found in trie');
      return false;
    }
  };

  let node = newData;
  let parent = null;
  await deleteNode(parent, node, str, 0);

  unfreezeButtons();
};

document.getElementById('InsertButton').addEventListener('click', addNode);
document.getElementById('DeleteButton').addEventListener('click', deleteNodeUtil);

// If during writing in insertion or deletion input field, user presses enter key then click on insertion/deletion button.
document.getElementById('InsertNodeField').addEventListener('keyup', function (event) {
  if (event.key === 'Enter') {
    document.getElementById('InsertButton').click();
  }
});
document.getElementById('DeleteNodeField').addEventListener('keyup', function (event) {
  if (event.key === 'Enter') {
    document.getElementById('DeleteButton').click();
  }
});
