import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Section11 = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [assessmentId, setAssessmentId] = useState(null);
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [vertices, setVertices] = useState([]);
  const [lines, setLines] = useState([]);
  const [currentLine, setCurrentLine] = useState(null);
  const [shapes, setShapes] = useState([]);
  const [selectedVertex, setSelectedVertex] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);

  useEffect(() => {
    const id = localStorage.getItem('assessmentId');
    if (id) setAssessmentId(parseInt(id));
  }, []);

  useEffect(() => {
    let timer;
    if (!isSubmitted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            handleSubmit();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isSubmitted, timeLeft]);

  const handleCanvasMouseDown = (e) => {
    if (isSubmitted) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const existingVertex = vertices.find(v => 
      Math.sqrt(Math.pow(v.x - x, 2) + Math.pow(v.y - y, 2)) < 10
    );

    if (existingVertex) {
      setSelectedVertex(existingVertex);
      setDrawing(true);
      setCurrentLine({
        start: existingVertex,
        end: { x, y }
      });
    } else {
      const newVertex = { x, y, id: Date.now() };
      setVertices([...vertices, newVertex]);
      setSelectedVertex(newVertex);
      setDrawing(true);
      setCurrentLine({
        start: newVertex,
        end: { x, y }
      });
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (!drawing || isSubmitted) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentLine(prev => ({
      ...prev,
      end: { x, y }
    }));
  };

  const handleCanvasMouseUp = (e) => {
    if (!drawing || isSubmitted) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const existingVertex = vertices.find(v => 
      v.id !== selectedVertex.id && 
      Math.sqrt(Math.pow(v.x - x, 2) + Math.pow(v.y - y, 2)) < 10
    );

    if (existingVertex) {
      setLines([...lines, {
        start: selectedVertex,
        end: existingVertex,
        id: Date.now()
      }]);
    } else {
      const newVertex = { x, y, id: Date.now() };
      setVertices([...vertices, newVertex]);
      setLines([...lines, {
        start: selectedVertex,
        end: newVertex,
        id: Date.now()
      }]);
    }

    setDrawing(false);
    setCurrentLine(null);
    setSelectedVertex(null);
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#eee';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < canvas.width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 20) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    lines.forEach(line => {
      ctx.beginPath();
      ctx.moveTo(line.start.x, line.start.y);
      ctx.lineTo(line.end.x, line.end.y);
      ctx.stroke();
    });

    if (currentLine) {
      ctx.beginPath();
      ctx.moveTo(currentLine.start.x, currentLine.start.y);
      ctx.lineTo(currentLine.end.x, currentLine.end.y);
      ctx.stroke();
    }

    vertices.forEach(vertex => {
      ctx.fillStyle = '#0066cc';
      ctx.beginPath();
      ctx.arc(vertex.x, vertex.y, 5, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  useEffect(() => {
    drawCanvas();
  }, [vertices, lines, currentLine]);

  const handleClear = () => {
    setVertices([]);
    setLines([]);
    setCurrentLine(null);
    setSelectedVertex(null);
    setShapes([]);
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const handleUndo = () => {
    if (lines.length > 0) {
      const newLines = [...lines];
      newLines.pop();
      setLines(newLines);
      
      const connectedVertices = new Set();
      newLines.forEach(line => {
        connectedVertices.add(line.start.id);
        connectedVertices.add(line.end.id);
      });
      
      setVertices(vertices.filter(v => connectedVertices.has(v.id)));
    }
  };

  const validateDrawing = () => {
    const { pentagons, quadrilaterals } = detectShapes(vertices, lines);
  
    console.log('Detected pentagons:', pentagons);
    console.log('Detected quadrilaterals:', quadrilaterals);
  
    if (quadrilaterals.length !== 1) {
      setVerificationResult('Error: Exactly one quadrilateral required.');
      return false;
    }
    if (pentagons.length !== 2) {
      setVerificationResult('Error: Exactly two pentagons required.');
      return false;
    }
    
    const isValid = isQuadrilateralBetween(pentagons, quadrilaterals[0]);
    setVerificationResult(
      isValid
        ? 'Success: Valid arrangement detected!'
        : 'Error: Invalid arrangement of shapes.'
    );
    return isValid;
  };
  
  
  const handleSubmit = async () => {
    if (isSubmitted || !assessmentId) return;
    setIsSubmitted(true);

    try {
      const isValid = validateDrawing();
      const responseTime = (60 - timeLeft) * 1000;

      const responseData = {
        assessment_id: assessmentId,
        section_number: 11,
        question_number: 1,
        user_response: JSON.stringify({ vertices, lines }),
        is_correct: isValid,
        response_time: responseTime,
      };

      console.log('Submitting response:', responseData);

      await axios.post('http://localhost:4000/store_section_response', responseData);

      setTimeout(() => {
        navigate('/assessment/section12');
      }, 1500);

    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Drawing Assessment</h2>
          <div className="text-lg font-bold text-blue-600">{timeLeft}s</div>
        </div>
        <div className="h-2 bg-gray-200 rounded">
          <div 
            className="h-2 bg-blue-600 rounded transition-all duration-1000"
            style={{ width: `${(timeLeft / 60) * 100}%` }}
          />
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-4">
          Draw a four-sided figure between two five-sided figures
        </h3>
        <p className="text-gray-600 mb-4">
          Click to place points and draw lines between them. Blue dots show where you can connect lines.
        </p>
      </div>

      <div className="mb-6">
        <div className="flex gap-4 mb-4">
          <button
            onClick={handleUndo}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
            disabled={isSubmitted || lines.length === 0}
          >
            Undo Last Line
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
            disabled={isSubmitted}
          >
            Clear Canvas
          </button>
        </div>

        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={() => {
            setDrawing(false);
            setCurrentLine(null);
          }}
          className="border-2 border-gray-300 rounded-lg bg-white cursor-crosshair"
        />
      </div>

      <div className="flex justify-between gap-4">
        <button
          onClick={handleSubmit}
          disabled={isSubmitted || lines.length === 0}
          className={`flex-1 px-8 py-3 rounded-full font-medium transition-colors ${
            isSubmitted || lines.length === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          Submit Drawing
        </button>
        {verificationResult && <p>{verificationResult}</p>}
      </div>
    </div>
  );
};

function lineIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
  // Calculate denominator
  const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (denominator === 0) return null;

  // Calculate intersection point
  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denominator;
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denominator;

  // Check if intersection occurs within both line segments
  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return {
      x: x1 + t * (x2 - x1),
      y: y1 + t * (y2 - y1)
    };
  }
  return null;
}

function findOverlappingShapes(vertices, lines) {
  // First, group lines into connected components to identify potential pentagons
  const adj = {};
  vertices.forEach(v => adj[v.id] = new Set());
  lines.forEach(l => {
    adj[l.start.id].add(l.end.id);
    adj[l.end.id].add(l.start.id);
  });

  // Find connected components (potential pentagons)
  const visited = new Set();
  const components = [];
  
  function dfs(start) {
    const component = new Set();
    const stack = [start];
    
    while (stack.length > 0) {
      const current = stack.pop();
      if (!component.has(current)) {
        component.add(current);
        adj[current].forEach(neighbor => {
          if (!component.has(neighbor)) {
            stack.push(neighbor);
          }
        });
      }
    }
    return Array.from(component);
  }

  vertices.forEach(v => {
    if (!visited.has(v.id)) {
      const component = dfs(v.id);
      component.forEach(id => visited.add(id));
      if (component.length === 5) {  // Only keep pentagon-sized components
        components.push(component);
      }
    }
  });

  // Convert components to actual pentagon shapes with their lines
  const pentagons = components.map(comp => {
    const pentagonLines = lines.filter(l => 
      comp.includes(l.start.id) && comp.includes(l.end.id)
    );
    return {
      vertices: comp.map(id => vertices.find(v => v.id === id)),
      lines: pentagonLines
    };
  });

  // Return early if we don't have exactly two pentagons
  if (pentagons.length !== 2) return { pentagons: [], quadrilaterals: [] };

  // Find intersection points between the two pentagons
  const intersections = [];
  pentagons[0].lines.forEach(l1 => {
    pentagons[1].lines.forEach(l2 => {
      const intersection = lineIntersection(
        l1.start.x, l1.start.y, l1.end.x, l1.end.y,
        l2.start.x, l2.start.y, l2.end.x, l2.end.y
      );
      if (intersection) {
        intersections.push(intersection);
      }
    });
  });

  // If we found intersection points, we have an overlapping quadrilateral
  const quadrilateral = intersections.length >= 2 ? [{
    points: intersections
  }] : [];

  return {
    pentagons: pentagons.map(p => ({ points: p.vertices })),
    quadrilaterals: quadrilateral
  };
}

function detectShapes(vertices, lines) {
  return findOverlappingShapes(vertices, lines);
}

function isQuadrilateralBetween(pentagons, quadrilateral) {
  // If we found intersections, it means the quadrilateral is formed by overlap
  // which by definition means it's "between" the pentagons
  return quadrilateral && pentagons.length === 2;
}

export default Section11;
