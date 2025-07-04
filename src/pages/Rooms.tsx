import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useApp } from "@/context/AppContext";
import { roomsAPI } from "@/services/api";





interface Room {
  _id: string;
  name: string;
  capacity: number;
  subjects: string[]; // Array of subject ObjectId strings
  faculty: string[]; // Array of faculty ObjectId strings
  createdAt: string; // or Date
  updatedAt: string; // or Date
  __v: number;
}


export default function Rooms() {
  const { role, setIsLoading } = useApp();
  const isAdmin = role === "admin";
  const { toast } = useToast();
  const [rooms, setRooms] = useState<{ _id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [isAlertDialogOpen, setAlertDialogOpen] = useState(false);

  const [currentRoom, setCurrentRoom] = useState<{
    _id: string;
    name: string;
  } | null>(null);
  const [formValue, setFormValue] = useState("");

  useEffect(() => {
    const fetchRooms = async () => {
      setIsLoading(true);
      try {
        console.log("Fetching rooms from API..aaaaa.");
        const data = await roomsAPI.getAll();

        // Map response data to extract _id and name
        const roomData = data.map((room: Room) => ({
          _id: room._id,
          name: room.name,
        }));

        setRooms(roomData.sort((a, b) => a.name.localeCompare(b.name)));
        console.log("Rooms fetched successfully:", roomData);
      } catch (error) {
        console.error("Error fetching rooms:", error);
        toast({
          title: "Error",
          description: "Failed to fetch rooms from server.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        setLoading(false);
      }
    };

    fetchRooms();
  }, [toast, setIsLoading]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formValue && !rooms.some((r) => r.name === formValue)) {
      setIsLoading(true);
      try {
        const response = await roomsAPI.create({
          name: formValue,
          capacity: 30, // Default capacity
        });

        const newRoom = response.room;
        setRooms((prev) =>
          [...prev, { _id: newRoom._id, name: newRoom.name }].sort((a, b) =>
            a.name.localeCompare(b.name)
          )
        );

        toast({
          title: "Room added",
          description: `Room "${newRoom.name}" has been added.`,
        });
      } catch (error) {
        console.error("Error adding room:", error);
        toast({
          title: "Error",
          description: "Failed to add room.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        setAddDialogOpen(false);
        setFormValue("");
      }
    } else {
      toast({
        title: "Error",
        description: "Room name cannot be empty or already exist.",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      formValue &&
      currentRoom &&
      (!rooms.some((r) => r.name === formValue) ||
        formValue === currentRoom.name)
    ) {
      setIsLoading(true);
      try {
        const response = await roomsAPI.update(currentRoom._id, {
          name: formValue,
        });

        const updatedRoom = response.room;
        setRooms((prev) =>
          prev
            .map((r) =>
              r._id === currentRoom._id
                ? { _id: r._id, name: updatedRoom.name }
                : r
            )
            .sort((a, b) => a.name.localeCompare(b.name))
        );

        setCurrentRoom({ _id: updatedRoom._id, name: updatedRoom.name });

        toast({
          title: "Room updated",
          description: `Room "${currentRoom.name}" has been updated to "${updatedRoom.name}".`,
        });
      } catch (error) {
        console.error("Error updating room:", error);
        toast({
          title: "Error",
          description: "Failed to update room.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        setEditDialogOpen(false);
        setFormValue("");
      }
    } else {
      toast({
        title: "Error",
        description: "Room name cannot be empty or already exist.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!currentRoom) return;

    setIsLoading(true);
    try {
      await roomsAPI.delete(currentRoom._id);

      setRooms((prev) => prev.filter((r) => r._id !== currentRoom._id));
      setCurrentRoom(null);

      toast({
        title: "Room deleted",
        description: `Room "${currentRoom.name}" has been removed.`,
      });
    } catch (error) {
      console.error("Error deleting room:", error);
      toast({
        title: "Error",
        description: "Failed to delete room.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setAlertDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading rooms...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Manage Rooms</h1>
          <p className="text-muted-foreground">
            {isAdmin
              ? "Add, edit, or delete rooms."
              : "Browse available rooms."}{" "}
            Room data is loaded from the server.
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => {
              setFormValue("");
              setAddDialogOpen(true);
            }}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            New Room
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {rooms.length > 0 ? (
          rooms.map((room) => (
            <Card key={room._id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <Link to={`/rooms/${room._id}`} className="hover:underline">
                    Room: {room.name}
                  </Link>
                </CardTitle>
                {isAdmin && (
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setCurrentRoom(room);
                        setFormValue(room.name);
                        setEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setCurrentRoom(room);
                        setAlertDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                )}
              </CardHeader>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">No rooms found.</p>
          </div>
        )}
      </div>

      {/* Add Room Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Room</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd}>
            <div className="grid gap-4 py-4">
              <Label htmlFor="room-name">Room Name</Label>
              <Input
                id="room-name"
                value={formValue}
                onChange={(e) => setFormValue(e.target.value)}
                placeholder="e.g. 0000"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Add Room</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Room Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Room: {currentRoom?.name || ""}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate}>
            <div className="grid gap-4 py-4">
              <Label htmlFor="edit-room-name">New Room Name</Label>
              <Input
                id="edit-room-name"
                value={formValue}
                onChange={(e) => setFormValue(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Room Alert Dialog */}
      <AlertDialog open={isAlertDialogOpen} onOpenChange={setAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will remove room "{currentRoom?.name || ""}" from the
              server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
