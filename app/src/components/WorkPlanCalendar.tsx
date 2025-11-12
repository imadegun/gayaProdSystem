"use client";

import { useState, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Users,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface WorkPlanAssignment {
  id: number;
  employeeId: number;
  productionStageId: number;
  collectCode: string;
  plannedQuantity: number;
  targetQuantity?: number;
  processName?: string;
  dayOfWeek: number;
  isOvertime: boolean;
  notes?: string;
  employee: {
    firstName: string;
    lastName: string;
    employeeCode: string;
  };
  productionStage: {
    name: string;
    code: string;
  };
  product: {
    collectCode: string;
    nameCode: string;
    categoryCode: string;
  };
}

interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  employeeCode: string;
  department?: string;
}

interface WorkPlanCalendarProps {
  workPlanId: number;
  weekStart: Date;
  weekEnd: Date;
  assignments: WorkPlanAssignment[];
  employees: Employee[];
  onAssignmentUpdate: (assignmentId: number, updates: Partial<WorkPlanAssignment>) => void;
  onAssignmentCreate: (assignment: Omit<WorkPlanAssignment, 'id'>) => void;
  onAssignmentDelete: (assignmentId: number) => void;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function WorkPlanCalendar({
  workPlanId,
  weekStart,
  weekEnd,
  assignments,
  employees,
  onAssignmentUpdate,
  onAssignmentCreate,
  onAssignmentDelete,
}: WorkPlanCalendarProps) {
  const [activeAssignment, setActiveAssignment] = useState<WorkPlanAssignment | null>(null);
  const [currentWeek, setCurrentWeek] = useState(weekStart);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const getAssignmentsForDay = (dayOfWeek: number) => {
    return assignments.filter(assignment => assignment.dayOfWeek === dayOfWeek);
  };

  const getAssignmentsForEmployee = (employeeId: number) => {
    return assignments.filter(assignment => assignment.employeeId === employeeId);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const assignment = assignments.find(a => a.id === active.id);
    setActiveAssignment(assignment || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveAssignment(null);

    if (!over) return;

    const assignmentId = active.id as number;
    const [targetType, targetId] = over.id.toString().split('-');

    if (targetType === 'day') {
      const newDayOfWeek = parseInt(targetId);
      onAssignmentUpdate(assignmentId, { dayOfWeek: newDayOfWeek });
    } else if (targetType === 'employee') {
      const newEmployeeId = parseInt(targetId);
      onAssignmentUpdate(assignmentId, { employeeId: newEmployeeId });
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newWeek);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getWeekDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeek);
      date.setDate(currentWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateWeek('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>
                  Week of {formatDate(currentWeek)} - {formatDate(weekDates[6])}
                </span>
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateWeek('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Assignment
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-8 gap-4">
            {/* Header row with days */}
            <div className="font-medium text-sm text-gray-500 p-2">Employee</div>
            {DAYS_OF_WEEK.map((day, index) => (
              <div key={day} className="text-center font-medium text-sm text-gray-500 p-2">
                <div>{day}</div>
                <div className="text-xs">{formatDate(weekDates[index])}</div>
              </div>
            ))}

            {/* Employee rows */}
            {employees.map((employee) => (
              <div key={employee.id} className="contents">
                <div className="flex items-center space-x-2 p-2 border-t">
                  <Users className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="font-medium text-sm">
                      {employee.firstName} {employee.lastName}
                    </div>
                    <div className="text-xs text-gray-500">{employee.employeeCode}</div>
                  </div>
                </div>

                {DAYS_OF_WEEK.map((_, dayIndex) => {
                  const dayAssignments = getAssignmentsForDay(dayIndex + 1)
                    .filter(assignment => assignment.employeeId === employee.id);

                  return (
                    <div
                      key={`${employee.id}-${dayIndex}`}
                      id={`employee-${employee.id}`}
                      className="min-h-[120px] border border-gray-200 rounded-md p-2 bg-gray-50"
                    >
                      <SortableContext
                        items={dayAssignments.map(a => a.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-2">
                          {dayAssignments.map((assignment) => (
                            <div
                              key={assignment.id}
                              id={assignment.id.toString()}
                              className="bg-white border border-gray-300 rounded p-2 text-xs cursor-move hover:shadow-sm transition-shadow"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-1">
                                  <Package className="h-3 w-3" />
                                  <span className="font-medium">
                                    {assignment.product.collectCode}
                                  </span>
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                  {assignment.productionStage.code}
                                </Badge>
                              </div>
                              <div className="mt-1 text-gray-600">
                                Planned: {assignment.plannedQuantity}
                                {assignment.targetQuantity && ` / ${assignment.targetQuantity}`}
                              </div>
                              {assignment.processName && (
                                <div className="text-gray-500">{assignment.processName}</div>
                              )}
                              {assignment.isOvertime && (
                                <Badge variant="destructive" className="text-xs mt-1">
                                  Overtime
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </SortableContext>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <DragOverlay>
        {activeAssignment ? (
          <div className="bg-white border border-gray-300 rounded p-2 text-xs shadow-lg rotate-3">
            <div className="flex items-center space-x-1">
              <Package className="h-3 w-3" />
              <span className="font-medium">
                {activeAssignment.product.collectCode}
              </span>
            </div>
            <div className="text-gray-600">
              Planned: {activeAssignment.plannedQuantity}
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}