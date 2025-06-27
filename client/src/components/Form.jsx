export default function Form({
  title,
  onChangeTitle,
  file,
  onChangeFile,
  onCreateNewConversation,
}) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-2xl">
        <h3 className="text-xl font-semibold mb-6 text-center">
          Start Learning Session
        </h3>
        <div className="mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Enter Title
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={title}
                onChange={(e) => onChangeTitle(e.target.value)}
                name="title"
                className="mb-5 flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter title"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Upload PDF</label>
            <input
              type="file"
              id="pdf"
              onChange={(e) => onChangeFile(e.target.files[0])}
              accept=".pdf"
              className="block w-full text-sm text-gray-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-600 file:text-white
                        hover:file:bg-blue-700"
            />
          </div>
        </div>
        <div className="flex gap-4 justify-center">
          <button
            onClick={(e) => onCreateNewConversation("ask", e)}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Ask Questions
          </button>
          <button
            onClick={(e) => onCreateNewConversation("attempt", e)}
            className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Attempt Questions
          </button>
        </div>
      </div>
    </div>
  );
}
